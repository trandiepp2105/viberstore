# cart_app/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import Http404
from django.core.exceptions import ValidationError # Import if service might raise it directly
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .services import CartService
from .serializers import CartItemSerializer # The updated serializer
# Adjust import if error schema is defined elsewhere
# from product_app.views import "Internal server erroe"

logger = logging.getLogger(__name__)

class CartView(APIView):
    """
    API endpoint for managing the user's shopping cart.
    GET: List all items in the cart.
    POST: Add or update an item in the cart.
    DELETE: Clear all items from the cart.
    """
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    @swagger_auto_schema(
        operation_summary="View Cart",
        operation_description="Retrieves all items currently in the authenticated user's cart.",
        responses={
            200: openapi.Response('List of cart items.', CartItemSerializer(many=True)), # List of cart items
            401: openapi.Response('Unauthorized'),
            500: openapi.Response('Internal server error'), # General error response
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def get(self, request, format=None):
        try:
            cart_items = CartService.list_cart_items(request.user)
            serializer = CartItemSerializer(cart_items, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing cart items for user {request.user.pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Add/Update Cart Item",
        operation_description="Adds a product variant to the cart or updates its quantity. If quantity is 0, the item is removed.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['variant', 'quantity'],
            properties={
                'variant': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the Product Variant'),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description='Desired final quantity (0 to remove)'),
            }
        ),
        responses={
            200: openapi.Response('Item updated successfully.', CartItemSerializer), # Includes correct price
            201: openapi.Response('Item added successfully.', CartItemSerializer),    # Includes correct price
            204: openapi.Response('Item removed successfully (quantity was 0).'),
            400: openapi.Response('Bad Request - Invalid input data.'),
            404: openapi.Response('Not Found - Variant not found.'),
            500: openapi.Response('Internal server error - Service failure.'),
            401: openapi.Response('Unauthorized - User not authenticated.'),
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def post(self, request, format=None):
        # Validate basic input format using serializer
        serializer = CartItemSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            variant_id = serializer.validated_data['variant'].id
            quantity = serializer.validated_data['quantity']

            try:
                # Service handles stock check and add/update/remove logic
                cart_item, success, message = CartService.add_or_update_item(
                    user=request.user,
                    variant_id=variant_id,
                    quantity=quantity
                )

                if success:
                    if cart_item: # Added or updated
                         # Serialize the result (serializer calculates price)
                         response_serializer = CartItemSerializer(cart_item, context={'request': request})
                         # Return 200 OK for simplicity for both add/update success
                         return Response(response_serializer.data, status=status.HTTP_200_OK)
                    else: # Removed (quantity was 0)
                         return Response(status=status.HTTP_204_NO_CONTENT)
                else:
                    # Service failure (stock, variant not found etc.)
                    return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

            except (ValueError, ValidationError) as e:
                logger.warning(f"Cart POST validation error for user {request.user.pk}: {e}. Data: {request.data}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error adding/updating cart item for user {request.user.pk}: {e}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Clear Cart",
        operation_description="Removes all items from the authenticated user's cart.",
        responses={
            204: openapi.Response('Cart cleared successfully.'),
            401: openapi.Response('Unauthorized - User not authenticated.'),
            500: openapi.Response('Internal server error - Service failure.'),
            404: openapi.Response('Not Found - Cart not found.'),
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def delete(self, request, format=None):
        try:
            deleted_count = CartService.clear_cart(request.user)
            logger.info(f"User {request.user.pk} cleared cart, removed {deleted_count} items.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error clearing cart for user {request.user.pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartItemDetailView(APIView):
    """
    API endpoint for managing a specific item within the user's cart.
    PUT/PATCH: Update the quantity of the item.
    DELETE: Remove the item from the cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_object(self, pk, user):
        """Helper to get a specific cart item owned by the user."""
        cart_item = CartService.get_cart_item_by_id(user=user, cart_item_id=pk)
        if cart_item is None:
            raise Http404("Cart item not found.")
        return cart_item

    @swagger_auto_schema(
        operation_summary="Update Cart Item Quantity",
        operation_description="Updates the quantity of a specific item in the cart. Set quantity to 0 to remove.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['quantity'],
            properties={
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description='New desired quantity (0 to remove)'),
            }
        ),
        responses={
            200: openapi.Response('Item quantity updated.', CartItemSerializer),
            204: openapi.Response('Item removed (quantity was 0).'),
            400: openapi.Response('Bad Request - Invalid input data.'),
            401: openapi.Response('Unauthorized - User not authenticated.'),
            404: openapi.Response('Not Found - Cart item not found.'),
            500: openapi.Response('Internal server error - Service failure.'),
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def put(self, request, pk, format=None):
        try:
            cart_item_to_update = self._get_object(pk, request.user)

            # Validate input quantity manually
            quantity = request.data.get('quantity')
            if quantity is None:
                return Response({"error": "Quantity is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                quantity = int(quantity)
                if quantity < 0:
                    raise ValueError("Quantity must be a non-negative integer.")
            except (ValueError, TypeError):
                return Response({"error": "Invalid quantity value."}, status=status.HTTP_400_BAD_REQUEST)

            # Use the same service logic as POST for consistency
            updated_item, success, message = CartService.add_or_update_item(
                user=request.user,
                variant_id=cart_item_to_update.variant_id,
                quantity=quantity
            )

            if success:
                if updated_item:  # Quantity updated
                    response_serializer = CartItemSerializer(updated_item, context={'request': request})
                    return Response(response_serializer.data, status=status.HTTP_200_OK)
                else:  # Item removed
                    return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                # Service failure (e.g., stock)
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error updating cart item {pk} for user {request.user.pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Cart Item Variant",
        operation_description="Updates the variant of a specific cart item and adjusts quantity if necessary.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['new_variant_id'],
            properties={
                'new_variant_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the new Product Variant'),
            }
        ),
        responses={
            200: openapi.Response('Cart item updated successfully.'),
            400: openapi.Response('Bad Request - Invalid input or stock issue.'),
            404: openapi.Response('Not Found - Cart item or variant not found.'),
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def patch(self, request, pk, format=None):
        new_variant_id = request.data.get('new_variant_id')
        if not new_variant_id:
            return Response({"error": "New variant ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        success, message = CartService.update_cart_item_variant(
            user=request.user,
            cart_item_id=pk,
            new_variant_id=new_variant_id
        )

        if success:
            return Response({"message": message}, status=status.HTTP_200_OK)
        else:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Remove Cart Item",
        operation_description="Removes a specific item from the authenticated user's cart.",
        responses={
            204: openapi.Response('Item removed successfully.'),
            401: openapi.Response('Unauthorized - User not authenticated.'),
            404: openapi.Response('Not Found - Cart item not found.'),
            500: openapi.Response('Internal server error - Service failure.'),
            400: openapi.Response('Bad Request - Invalid input data.'),
        },
        security=[{'Bearer': []}],
        tags=['Cart']
    )
    def delete(self, request, pk, format=None):
        try:
            # _get_object(pk, request.user) # Optional check before delete
            success = CartService.remove_item(user=request.user, cart_item_id=pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                 return Response({"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting cart item {pk} for user {request.user.pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from cart.models import CartItem

class BulkDeleteCartItemsView(APIView):
    """
    View to delete multiple cart items at once.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, format=None):
        cart_item_ids = request.data.get('cart_item_ids', [])
        if not isinstance(cart_item_ids, list) or not cart_item_ids:
            return Response(
                {"error": "A list of cart item IDs is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Filter cart items belonging to the user
        cart_items = CartItem.objects.filter(user=request.user, id__in=cart_item_ids)
        if not cart_items.exists():
            return Response(
                {"error": "No valid cart items found for deletion."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete the cart items
        deleted_count, _ = cart_items.delete()
        return Response(
            {"message": f"{deleted_count} cart item(s) deleted successfully."},
            status=status.HTTP_200_OK
        )