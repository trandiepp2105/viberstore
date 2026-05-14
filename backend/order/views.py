from rest_framework.permissions import IsAuthenticated

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# order_app/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import Http404
from django.core.exceptions import ValidationError
# Import services and serializers
from order.services import (
    OrderService,  LookupService,
)
from order.serializers import (OrderSerializer,
    OrderStatusSerializer, ShippingMethodSerializer, OrderHistorySerializer
    # Add other serializers as needed for specific endpoints
)

        
from rest_framework.exceptions import PermissionDenied, NotFound
from order.models import Order, OrderStatus, OrderHistory
# Import permissions
logger = logging.getLogger(__name__)

# --- Order Views ---
from payment.services import PaymentService

class OrderListCreateAPIView(APIView):
    """
    List orders (user sees own, admin sees all) or create a new order from cart.
    """
    permission_classes = [permissions.IsAuthenticated] # Base requirement

    def get_queryset(self, request):
        """Helper to determine queryset based on user role."""
        
        filters = {}
        # Filter by status
        status_id = request.query_params.get('status')
        if status_id:
            filters['status_id'] = status_id
                # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            filters['order_date__gte'] = start_date
        if end_date:
            filters['order_date__lte'] = end_date

        # Filter by amount range
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')
        if min_amount:
            filters['final_amount__gte'] = min_amount
        if max_amount:
            filters['final_amount__lte'] = max_amount

        # Filter by payment method
        payment_method_id = request.query_params.get('payment_method')
        if payment_method_id:
            filters['payment_method_id'] = payment_method_id

        
        if request.user.is_staff:
            # Admin sees all, apply filters from query params
            return OrderService.list_all_orders(filters=filters)
        else:

            return OrderService.list_orders_for_user(request.user, filters=filters)

    @swagger_auto_schema(
        operation_summary="List Orders",
        operation_description="Retrieves a list of orders. Authenticated users see their own orders. Admins see all orders and can filter by 'status' (ID) or 'user' (ID).",
        manual_parameters=[ # Document parameters for admins
            openapi.Parameter('status', openapi.IN_QUERY, description="(Admin) Filter by OrderStatus ID", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('user', openapi.IN_QUERY, description="(Admin) Filter by User ID", type=openapi.TYPE_INTEGER, required=False),
        ],
        responses={
            200: openapi.Response(description="List of orders", schema=OrderSerializer(many=True)),
            401: openapi.Response(description="Unauthorized"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def get(self, request, format=None):
        try:
            orders = self.get_queryset(request)
            serializer = OrderSerializer(orders, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing orders for user {request.user.pk} (is_staff={request.user.is_staff}): {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @swagger_auto_schema(
        operation_summary="Create Order (from Cart)",
        operation_description="Creates a new order based on the user's current cart content. Requires delivery, shipping, and payment method IDs.",
        request_body=OrderSerializer, # Use the dedicated serializer for input
        responses={
            201: openapi.Response(description="Order created", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            401: openapi.Response(description="Unauthorized"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def post(self, request, format=None):
        # Validate input using OrderCreateSerializer
        create_data = {
            "user": request.user,
            "delivery_address_id": request.data.get('delivery_info', None),
            "payment_method_id": request.data.get('payment_method'),
            "customer_note": request.data.get('customer_note', None),
            "cart_item_ids": request.data.get('cart_item_ids', []),
            "coupons": request.data.get('coupons', []),
        }
        try:
            # Call service with validated data
            order = OrderService.create_order_from_cart(
                    user=request.user,
                    payment_method_id=request.data.get('payment_method'),
                    delivery_address_id= request.data.get('delivery_info', None),
                    customer_note= request.data.get('customer_note', None),
                    cart_item_ids=request.data.get('cart_item_ids', []),
                    coupons=request.data.get('coupons', []),
            )
            # Serialize the created order for the response
            response_serializer = OrderSerializer(order, context={'request': request})
            payment_method = PaymentService.get_payment_method_by_id(request.data.get('payment_method'))

            if payment_method.code == 'VNPAY':
                _, vnpay_payment_url = PaymentService.vnpay_payment(request=request, order=order, payment_method=payment_method, transaction_id=order.id, gateway_response=None, amount=order.total_amount)
                reponse_data = response_serializer.data
                reponse_data['vnpay_payment_url'] = vnpay_payment_url
                return Response(reponse_data, status=status.HTTP_201_CREATED)


            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except (ValueError, ValidationError) as e: # Catch errors like cart empty, stock issue
                logger.warning(f"Failed to create order for user {request.user.pk}: {e}. Input: {create_data}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as e: # Catch service configuration errors
                logger.error(f"Runtime error creating order for user {request.user.pk}: {e}", exc_info=True)
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
                logger.error(f"Unexpected error creating order for user {request.user.pk}: {e}", exc_info=True)
                return Response({"error": "An internal server error occurred while creating the order."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderDetailAPIView(APIView):
    """
    Retrieve details of a specific order.
    Update status or add admin note (Admin only).
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_object(self, pk, user):
        """Gets order, checking ownership for non-admins."""
        order = OrderService.get_order_detail(order_id=pk, user=None if user.is_staff else user)
        if order is None:
            raise Http404("Order not found.")
        return order

    @swagger_auto_schema(
        operation_summary="Retrieve Order Details",
        operation_description="Retrieves full details of a specific order, including items, history, payment, etc. Users can only view their own orders unless they are admins.",
        responses={
            200: openapi.Response(description="Order details", schema=OrderSerializer),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def get(self, request, pk, format=None):
        try:
            order = self._get_object(pk, request.user)
            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error retrieving order {pk} for user {request.user.pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Order Status (Admin Only)",
        operation_description="Updates the status of an order. Requires admin privileges.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['status_code'],
            properties={
                'status_code': openapi.Schema(type=openapi.TYPE_STRING, description="The new status code (e.g., 'PROCESSING', 'SHIPPED')"),
                'note': openapi.Schema(type=openapi.TYPE_STRING, description="(Optional) Note for the history entry.", nullable=True),
            }
        ),
        responses={
            200: openapi.Response(description="Updated order", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders (Admin Actions)']
    )
    def patch(self, request, pk, format=None): # Use PATCH for partial update (status)
        # Check if user is admin first
        if not request.user.is_staff:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        status_code = request.data.get('status_code')
        note = request.data.get('note')

        if not status_code:
             return Response({"error": "status_code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
             # Service handles fetching order, status object, saving, history
             updated_order = OrderService.update_order_status(
                 order_id=pk,
                 new_status_code=status_code,
                 staff_user=request.user,
                 note=note
             )
             serializer = OrderSerializer(updated_order, context={'request': request})
             return Response(serializer.data)
        except ValueError as e: # Catch errors like "Order not found", "Status code not found", "Invalid transition"
             status_code_http = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
             logger.warning(f"Failed to update status for order {pk}: {e}. Data: {request.data}")
             return Response({"error": str(e)}, status=status_code_http)
        except Exception as e:
             logger.error(f"Unexpected error updating status for order {pk}: {e}. Data: {request.data}", exc_info=True)
             return Response({"error": "An internal server error occurred while updating status."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Process Order",
        operation_description="Processes the order to the next status in the sequence: PENDING -> PACKED -> DELIVERING -> DELIVERED.",
        responses={
            200: openapi.Response(description="Order processed", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def post(self, request, pk, format=None):
        try:
            order = OrderService.process_order(order_id=pk, staff_user=request.user)
            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing order {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Cancel Order",
        operation_description="Cancels the order and creates a CancelledOrder record.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'reason': openapi.Schema(type=openapi.TYPE_STRING, description="Reason for cancellation", nullable=True),
            }
        ),
        responses={
            200: openapi.Response(description="Order cancelled", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def delete(self, request, pk, format=None):
        try:
            success = OrderService.delete_order(order_id=pk)
            if success:
                return Response({"message": "Order deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error cancelling order {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderDeleteAPIView(APIView):
    """
    Deletes an order.
    """
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Delete Order",
        operation_description="Deletes an order and all related records.",
        responses={
            204: openapi.Response(description="Order deleted"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def delete(self, request, pk, format=None):
        try:
            success = OrderService.delete_order(order_id=pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting order {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Lookup Table Views (Example for OrderStatus - Admin Only) ---

class OrderStatusListCreateAPIView(APIView):
    """
    List order statuses (accessible to authenticated users) or create a new order status (admin only).
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    serializer_class = OrderStatusSerializer

    @swagger_auto_schema(
        responses={200: openapi.Response(description="List of order statuses", schema=OrderStatusSerializer(many=True))},
        security=[{'Bearer': []}], tags=['Lookups']
    )
    def get(self, request, format=None):
        statuses = LookupService.list_order_statuses()
        serializer = self.serializer_class(statuses, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=OrderStatusSerializer,
        responses={
            201: openapi.Response(description="Order status created", schema=OrderStatusSerializer),
            400: openapi.Response(description="Validation error")
        },
        security=[{'Bearer': []}], tags=['Lookups (Admin)']
    )
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                instance = LookupService._create(OrderStatus, serializer.validated_data)
                response_serializer = self.serializer_class(instance)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderStatusDetailAPIView(APIView):
    """
    Retrieve order status details (accessible to authenticated users) or perform other actions (admin only).
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    serializer_class = OrderStatusSerializer

    def _get_object(self, pk):
        instance = LookupService.get_order_status(pk)
        if not instance:
            raise Http404
        return instance

    @swagger_auto_schema(
        responses={
            200: openapi.Response(description="Order status details", schema=OrderStatusSerializer),
            404: openapi.Response(description="Order status not found")
        },
        security=[{'Bearer': []}], tags=['Lookups']
    )
    def get(self, request, pk, format=None):
        instance = self._get_object(pk)
        serializer = self.serializer_class(instance)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=OrderStatusSerializer,
        responses={
            200: openapi.Response(description="Order status updated", schema=OrderStatusSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order status not found")
        },
        security=[{'Bearer': []}], tags=['Lookups (Admin)']
    )
    def put(self, request, pk, format=None):
        instance = self._get_object(pk)
        serializer = self.serializer_class(instance, data=request.data, partial=False)
        if serializer.is_valid():
            try:
                updated = LookupService._update(OrderStatus, pk, serializer.validated_data)
                return Response(self.serializer_class(updated).data)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=OrderStatusSerializer,
        responses={
            200: openapi.Response(description="Order status partially updated", schema=OrderStatusSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order status not found")
        },
        security=[{'Bearer': []}], tags=['Lookups (Admin)']
    )
    def patch(self, request, pk, format=None):
        instance = self._get_object(pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                updated = LookupService._update(OrderStatus, pk, serializer.validated_data)
                return Response(self.serializer_class(updated).data)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={
            204: openapi.Response(description="Order status deleted"),
            404: openapi.Response(description="Order status not found"),
            400: openapi.Response(description="Validation error")
        },
        security=[{'Bearer': []}], tags=['Lookups (Admin)']
    )
    def delete(self, request, pk, format=None):
        try:
            if LookupService._delete(OrderStatus, pk):
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Not Found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from cart.services import CartService
from marketing.models import Coupon
from marketing.services import CouponService

class TemporaryOrderAPIView(APIView):
    """
    Calculate and return temporary order details based on cart items and optional coupon IDs.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get Temporary Order Details",
        operation_description="Calculates temporary order details based on cart items and optional coupon IDs. If no coupon IDs are provided, checks for a free shipping coupon.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'cart_item_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    description="List of cart item IDs to include in the temporary order."
                ),
                'coupon_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_INTEGER),
                    description="List of coupon IDs to apply to the temporary order."
                ),
            },
            required=['cart_item_ids']
        ),
        responses={
            200: openapi.Response(description="Temporary order details"),
            400: openapi.Response(description="Validation error"),
            401: openapi.Response(description="Unauthorized"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def post(self, request, format=None):
        try:
            # Extract input data
            cart_item_ids = request.data.get('cart_item_ids', [])
            coupon_ids = request.data.get('coupon_ids', [])

            if not cart_item_ids:
                return Response({"error": "cart_item_ids is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch cart items
            cart_items = CartService.get_cart_items_by_ids(request.user, cart_item_ids)
            if not cart_items:
                return Response({"error": "No valid cart items found."}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate subtotal
            subtotal = 0
            final_amount = 0
            for item in cart_items:
                price = item.variant.product.price if item.variant.product.sale_price == 0 else item.variant.product.sale_price
                subtotal += item.quantity * item.variant.product.price
                final_amount += item.quantity * price
            promotion = final_amount - subtotal
            # Fetch and validate coupons
            selected_coupons = []
            if coupon_ids:
                selected_coupons = CouponService.get_valid_coupons_by_ids(coupon_ids)
            else:
                # Check for free shipping coupon if no coupon IDs are provided
                free_shipping_coupons = CouponService.get_free_shipping_coupons()
                if free_shipping_coupons:
                    selected_coupons.append(free_shipping_coupons[0])  # Take the first free shipping coupon

            # Calculate discounts and final amount
            discount = CouponService.calculate_discount(selected_coupons, subtotal)
            final_amount = final_amount - discount

            # Prepare response data
            response_data = {
                "total_amount": subtotal,
                "promotion": promotion,
                "discount": discount,
                "final_amount": final_amount,
                "selected_coupons": selected_coupons,
                "cart_items": cart_items,
            }

            serializer = OrderSerializer(response_data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error calculating temporary order for user {request.user.pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .services import ShippingMethodService
from .models import ShippingMethod
from .serializers import ShippingMethodSerializer
import logging

logger = logging.getLogger(__name__)

class ShippingMethodListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List Shipping Methods",
        operation_description="Retrieve a list of all shipping methods.",
        responses={
            200: openapi.Response('List of shipping methods.', ShippingMethodSerializer(many=True)),
        },
        tags=['Shipping Methods']
    )
    def get(self, request, format=None):
        try:
            only_active = request.query_params.get('only_active', 'true').lower() in ['true', '1']
            methods = ShippingMethodService.list_shipping_methods(only_active=only_active)
            serializer = ShippingMethodSerializer(methods, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error listing shipping methods: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @swagger_auto_schema(
        operation_summary="Create Shipping Method",
        operation_description="Create a new shipping method.",
        request_body=ShippingMethodSerializer,
        responses={
            201: openapi.Response('Shipping method created successfully.', ShippingMethodSerializer),
            400: openapi.Response('Bad Request - Invalid input data.'),
        },
        tags=['Shipping Methods']
    )
    def post(self, request, format=None):
        serializer = ShippingMethodSerializer(data=request.data)
        if serializer.is_valid():
            try:
                shipping_method = ShippingMethodService.create_shipping_method(serializer.validated_data)
                response_serializer = ShippingMethodSerializer(shipping_method)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error creating shipping method: {e}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShippingMethodDetailAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Retrieve Shipping Method",
        operation_description="Retrieve details of a specific shipping method by its ID.",
        responses={
            200: openapi.Response('Shipping method details.', ShippingMethodSerializer),
            404: openapi.Response('Not Found - Shipping method not found.'),
        },
        tags=['Shipping Methods']
    )
    def get(self, request, pk, format=None):
        method = ShippingMethodService.get_shipping_method_by_id(pk)
        if not method:
            return Response({"error": "Shipping method not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ShippingMethodSerializer(method)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Update Shipping Method",
        operation_description="Update an existing shipping method.",
        request_body=ShippingMethodSerializer,
        responses={
            200: openapi.Response('Shipping method updated successfully.', ShippingMethodSerializer),
            404: openapi.Response('Not Found - Shipping method not found.'),
            400: openapi.Response('Bad Request - Invalid input data.'),
        },
        tags=['Shipping Methods']
    )
    def put(self, request, pk, format=None):
        serializer = ShippingMethodSerializer(data=request.data)
        if serializer.is_valid():
            try:
                shipping_method = ShippingMethodService.update_shipping_method(pk, serializer.validated_data)
                response_serializer = ShippingMethodSerializer(shipping_method)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error updating shipping method: {e}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete Shipping Method",
        operation_description="Delete a specific shipping method by its ID.",
        responses={
            204: openapi.Response('No Content'),
            404: openapi.Response('Not Found - Shipping method not found.'),
        },
        tags=['Shipping Methods']
    )
    def delete(self, request, pk, format=None):
        success = ShippingMethodService.delete_shipping_method(pk)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Shipping method not found."}, status=status.HTTP_404_NOT_FOUND)

from order.services import DeliveryMethodService
from order.models import DeliveryMethod
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class DeliveryMethodListAPIView(APIView):
    """
    List all delivery methods.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="List Delivery Methods",
        operation_description="Retrieve a list of all delivery methods.",
        responses={200: openapi.Response("OK", openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "id": openapi.Schema(type=openapi.TYPE_INTEGER),
                    "name": openapi.Schema(type=openapi.TYPE_STRING),
                    "description": openapi.Schema(type=openapi.TYPE_STRING),
                    "code": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        ))},
        tags=["Delivery Methods"]
    )
    def get(self, request, format=None):
        methods = DeliveryMethodService.list_delivery_methods()
        data = [{"id": method.id, "name": method.name, "description": method.description, "code": method.code} for method in methods]
        return Response(data, status=status.HTTP_200_OK)

class CancelOrderAPIView(APIView):
    """
    Cancel an order and create a CancelledOrder record.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Cancel Order",
        operation_description="Cancels an order and creates a CancelledOrder record. Requires a reason for cancellation.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'reason': openapi.Schema(type=openapi.TYPE_STRING, description="Reason for cancellation", nullable=True),
            }
        ),
        responses={
            200: openapi.Response(description="Order cancelled", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def post(self, request, pk, format=None):
        reason = request.data.get('reason', None)
        try:
            order = OrderService.cancel_order(order_id=pk, staff_user=request.user if request.user.is_staff else None, reason=reason)
            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error canceling order {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProcessOrderAPIView(APIView):
    """
    Process an order to the next status in the sequence.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Process Order",
        operation_description="Processes the order to the next status in the sequence: PENDING -> PACKED -> DELIVERING -> DELIVERED.",
        responses={
            200: openapi.Response(description="Order processed", schema=OrderSerializer),
            400: openapi.Response(description="Validation error"),
            404: openapi.Response(description="Order not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Orders']
    )
    def post(self, request, pk, format=None):
        try:
            staff_user = None
            if request.user.is_staff:
                staff_user = request.user
            order = OrderService.process_order(order_id=pk, staff_user=staff_user)
            serializer = OrderSerializer(order, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing order {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderHistoryAPIView(APIView):
    """
    Retrieve the history of a specific order.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        try:
            # Check if the user has access to the order
            if not request.user.is_staff:
                # Non-admin users can only access their own orders
                order = Order.objects.filter(pk=pk, user=request.user).first()
                if not order:
                    raise PermissionDenied("You do not have permission to access this order.")
            else:
                # Admins can access any order
                order = Order.objects.filter(pk=pk).first()
                if not order:
                    raise NotFound("Order not found.")

            # Retrieve the history for the specific order
            histories = OrderHistory.objects.filter(order=order).select_related('status', 'staff_in_charge')
            serializer = OrderHistorySerializer(histories, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An internal server error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

