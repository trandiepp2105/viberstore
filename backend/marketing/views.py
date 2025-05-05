# marketing_app/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import Http404
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from decimal import Decimal # Import if validating/using Decimal amounts

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from typing import Optional
# Import services and serializers
from marketing.services import PromotionService, CouponService, CouponUsageService
from marketing.serializers import (
    PromotionSerializer, CouponSerializer, PromotionAssignmentSerializer,
    CouponValidationRequestSerializer, CouponValidationResponseSerializer,
    CouponUsageSerializer
)
from marketing.enums import PromotionType # Assuming enums are defined in enums.py
# Import permissions if needed
# from .permissions import IsAdminUser, ReadOnly # Or use DRF's built-ins


logger = logging.getLogger(__name__)

# --- Promotion Views (Admin Only) ---
def _parse_query_param_bool(param_value: Optional[str], default: Optional[bool] = None) -> Optional[bool]:
    """Chuyển đổi chuỗi thành giá trị boolean hoặc trả về giá trị mặc định."""
    if param_value is None:
        return default
    param_value = param_value.lower()
    if param_value in ['true', '1', 'yes', 'y']:
        return True
    elif param_value in ['false', '0', 'no', 'n']:
        return False
    else:
        raise ValueError(f"Invalid boolean value: {param_value}")
class PromotionListCreateAPIView(APIView):
    """List promotions or create a new one (Admin Only)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = PromotionSerializer # Hint for swagger

    @swagger_auto_schema(
        operation_summary="List Promotions",
        manual_parameters=[
             openapi.Parameter('is_active', openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN),
             openapi.Parameter('type', openapi.IN_QUERY, type=openapi.TYPE_STRING, enum=[t[0] for t in PromotionType.choices()]), # Use enum choices
             openapi.Parameter('active_now', openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN, description="Filter promotions currently active within their date range."),
        ],
        responses={
            200: openapi.Response("List of Promotions", PromotionSerializer(many=True)),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def get(self, request, format=None):
        filters = {
            'is_active': request.query_params.get('is_active'),
            'type': request.query_params.get('type'),
            'active_now': request.query_params.get('active_now')
        }
        # Convert boolean strings
        if filters['is_active'] is not None: filters['is_active'] = filters['is_active'].lower() == 'true'
        if filters['active_now'] is not None: filters['active_now'] = filters['active_now'].lower() == 'true'
        filters = {k: v for k, v in filters.items() if v is not None}

        promotions = PromotionService.list_promotions(filters=filters)
        serializer = self.serializer_class(promotions, many=True, context={'request': request})
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Create Promotion",
        request_body=PromotionSerializer,
        responses={
            201: openapi.Response("Promotion Created", PromotionSerializer),
            400: openapi.Response("Bad Request"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                promotion = PromotionService.create_promotion(serializer.validated_data)
                response_serializer = self.serializer_class(promotion, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, IntegrityError, ValidationError) as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error creating promotion: {e}", exc_info=True)
                return Response({"error": "Could not create promotion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PromotionDetailAPIView(APIView):
    """Retrieve, update, or delete a specific promotion (Admin Only)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = PromotionSerializer

    def _get_object(self, pk):
        promo = PromotionService.get_promotion_by_id(pk)
        if not promo: raise Http404("Promotion not found.")
        return promo

    @swagger_auto_schema(
        responses={
            200: openapi.Response("Promotion Details", PromotionSerializer),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def get(self, request, pk, format=None):
        try:
            promo = self._get_object(pk)
            serializer = self.serializer_class(promo, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        request_body=PromotionSerializer,
        responses={
            200: openapi.Response("Promotion Updated", PromotionSerializer),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def put(self, request, pk, format=None):
        promo = self._get_object(pk) # Check existence
        serializer = self.serializer_class(promo, data=request.data, partial=False, context={'request': request})
        if serializer.is_valid():
            try:
                updated_promo = PromotionService.update_promotion(pk, serializer.validated_data)
                return Response(self.serializer_class(updated_promo, context={'request': request}).data)
            except (ValueError, ValidationError) as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error updating promotion {pk}: {e}", exc_info=True)
                return Response({"error": "Could not update promotion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=PromotionSerializer,
        responses={
            200: openapi.Response("Promotion Partially Updated", PromotionSerializer),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def patch(self, request, pk, format=None):
        promo = self._get_object(pk)
        serializer = self.serializer_class(promo, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            try:
                updated_promo = PromotionService.update_promotion(pk, serializer.validated_data)
                return Response(self.serializer_class(updated_promo, context={'request': request}).data)
            except (ValueError, ValidationError) as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error patching promotion {pk}: {e}", exc_info=True)
                return Response({"error": "Could not update promotion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={
            204: openapi.Response("No Content"),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin)']
    )
    def delete(self, request, pk, format=None):
        try:
            if PromotionService.delete_promotion(pk):
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Promotion not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting promotion {pk}: {e}", exc_info=True)
             return Response({"error": "Could not delete promotion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromotionAssignmentAPIView(APIView):
    """Assign/Remove promotion from products/categories (Admin Only)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = PromotionAssignmentSerializer # For input validation

    @swagger_auto_schema(
        operation_summary="Assign Promotion",
        operation_description="Assigns a promotion to a list of product IDs and/or category IDs.",
        request_body=PromotionAssignmentSerializer,
        responses={
            200: openapi.Response("Promotion Assigned Successfully"),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin Actions)']
    )
    def post(self, request, format=None): # Use POST for assignment action
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                PromotionService.assign_promotion(serializer.validated_data)
                return Response({"message": "Promotion assigned successfully."}, status=status.HTTP_200_OK)
            except ValueError as e: # e.g., Promotion not found
                 return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                 logger.error(f"Error assigning promotion: {e}", exc_info=True)
                 return Response({"error": "Could not assign promotion."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Remove Promotion Assignment",
        operation_description="Removes a promotion assignment from a list of product IDs and/or category IDs.",
        request_body=PromotionAssignmentSerializer,
        responses={
            200: openapi.Response("Promotion Assignments Removed"),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Promotion Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Promotions (Admin Actions)']
    )
    def delete(self, request, format=None): # Use DELETE for removal action (or POST with specific action field)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                p_count, c_count = PromotionService.remove_promotion_assignments(serializer.validated_data)
                return Response({"message": f"Removed assignments from {p_count} products and {c_count} categories."}, status=status.HTTP_200_OK)
            except ValueError as e: # e.g., Promotion not found
                 return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                 logger.error(f"Error removing promotion assignments: {e}", exc_info=True)
                 return Response({"error": "Could not remove assignments."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Coupon Views (Admin Only for Management, Authenticated for Validation) ---

class CouponListCreateAPIView(APIView):
    """List coupons or create a new one."""
    serializer_class = CouponSerializer # Hint for swagger
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @swagger_auto_schema(
        operation_summary="List Coupons",
        manual_parameters=[
            openapi.Parameter('is_active', openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('code', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search by coupon code (contains, case-insensitive)"),
            openapi.Parameter('active_now', openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN, description="Filter coupons currently active within their date range."),
        ],
        responses={
            200: openapi.Response("List of Coupons", CouponSerializer(many=True)),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def get(self, request, format=None):
        filters = {
            'is_active': _parse_query_param_bool(request.query_params.get('is_active')),
            'code': request.query_params.get('code'),
            'active_now': _parse_query_param_bool(request.query_params.get('active_now')),
            'type': request.query_params.get('type'), # Optional filter for type
        }
        filters = {k: v for k, v in filters.items() if v is not None}
        coupons = CouponService.list_coupons(filters=filters)
        serializer = self.serializer_class(coupons, many=True, context={'request': request})
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Create Coupon",
        operation_description="Creates a new coupon with the provided details. Type in ['percentage', 'fixed', 'free shipping', 'buy one get one']",
        request_body=CouponSerializer,
        responses={
            201: openapi.Response("Coupon Created", CouponSerializer),
            400: openapi.Response("Bad Request"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                coupon = CouponService.create_coupon(serializer.validated_data)
                response_serializer = self.serializer_class(coupon, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, IntegrityError, ValidationError) as e:
                print("Error creating coupon:", str(e))  # Debugging line
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print("Unexpected error:", str(e))  # Debugging line
                logger.error(f"Error creating coupon: {e}", exc_info=True)
                return Response({"error": "Could not create coupon."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("Serializer errors:", serializer.errors)  # Debugging line
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CouponDetailAPIView(APIView):
    """Retrieve, update, or delete a specific coupon (Admin Only)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CouponSerializer

    def _get_object(self, pk):
        # Can use ID or code for detail view? Let's stick to PK for consistency.
        coupon = CouponService.get_coupon_by_id(pk)
        # Or: coupon = CouponService.get_coupon_by_code(code) if using code in URL
        if not coupon: raise Http404("Coupon not found.")
        return coupon

    @swagger_auto_schema(
        responses={
            200: openapi.Response("Coupon Details", CouponSerializer),
            404: openapi.Response("Coupon Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def get(self, request, pk, format=None):
        try:
            coupon = self._get_object(pk)
            serializer = self.serializer_class(coupon, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        request_body=CouponSerializer,
        responses={
            200: openapi.Response("Coupon Updated", CouponSerializer),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Coupon Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def put(self, request, pk, format=None):
        coupon = self._get_object(pk)
        serializer = self.serializer_class(coupon, data=request.data, partial=False, context={'request': request})
        if serializer.is_valid():
            try:
                updated_coupon = CouponService.update_coupon(pk, serializer.validated_data)
                return Response(self.serializer_class(updated_coupon, context={'request': request}).data)
            except (ValueError, ValidationError) as e:
                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 logger.error(f"Error updating coupon {pk}: {e}", exc_info=True)
                 return Response({"error": "Could not update coupon."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=CouponSerializer,
        responses={
            200: openapi.Response("Coupon Partially Updated", CouponSerializer),
            400: openapi.Response("Bad Request"),
            404: openapi.Response("Coupon Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def patch(self, request, pk, format=None):
        coupon = self._get_object(pk)
        serializer = self.serializer_class(coupon, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
             try:
                 updated_coupon = CouponService.update_coupon(pk, serializer.validated_data)
                 return Response(self.serializer_class(updated_coupon, context={'request': request}).data)
             except (ValueError, ValidationError) as e:
                  return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
             except Exception as e:
                  logger.error(f"Error patching coupon {pk}: {e}", exc_info=True)
                  return Response({"error": "Could not update coupon."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={
            204: openapi.Response("No Content"),
            404: openapi.Response("Coupon Not Found"),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin)']
    )
    def delete(self, request, pk, format=None):
        try:
            if CouponService.delete_coupon(pk):
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting coupon {pk}: {e}", exc_info=True)
             return Response({"error": "Could not delete coupon."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CouponValidateAPIView(APIView):
    """Validates a coupon code for the current user."""
    permission_classes = [permissions.IsAuthenticated] # User must be logged in

    @swagger_auto_schema(
        operation_summary="Validate Coupon Code",
        operation_description="Checks if a coupon code is valid for the current user and optionally for a given order amount.",
        request_body=CouponValidationRequestSerializer,
        responses={
            200: openapi.Response("Validation Result", CouponValidationResponseSerializer),
            400: openapi.Response("Bad Request")
        },
        security=[{'Bearer': []}], tags=['Coupons (User Actions)']
    )
    def post(self, request, format=None):
        serializer = CouponValidationRequestSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['code']
            order_amount_str = request.data.get('order_amount') # Optional order amount from request
            order_amount = None
            if order_amount_str:
                try:
                     # IMPORTANT: Use Decimal for monetary values
                     order_amount = Decimal(order_amount_str)
                     if order_amount < 0: raise ValueError()
                except (ValueError, TypeError):
                     return Response({"error": "Invalid order_amount provided."}, status=status.HTTP_400_BAD_REQUEST)

            # Call the validation service
            validation_result = CouponService.validate_coupon(
                user=request.user,
                code=code,
                order_amount=order_amount
            )
            # Serialize the result for the response
            response_serializer = CouponValidationResponseSerializer(validation_result)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CouponUsageListAPIView(APIView):
    """List coupon usage records (Admin Only)."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CouponUsageSerializer

    @swagger_auto_schema(
        operation_summary="List Coupon Usage",
        manual_parameters=[
             openapi.Parameter('user_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
             openapi.Parameter('coupon_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
             openapi.Parameter('order_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: openapi.Response("List of Coupon Usage Records", CouponUsageSerializer(many=True)),
            401: openapi.Response("Unauthorized"),
            403: openapi.Response("Forbidden")
        },
        security=[{'Bearer': []}], tags=['Coupons (Admin Actions)']
    )
    def get(self, request, format=None):
        filters = {
            'user_id': request.query_params.get('user_id'),
            'coupon_id': request.query_params.get('coupon_id'),
            'order_id': request.query_params.get('order_id'),
        }
        filters = {k: v for k, v in filters.items() if v} # Remove None/empty
        usage_records = CouponUsageService.list_coupon_usage(filters=filters)
        serializer = self.serializer_class(usage_records, many=True, context={'request': request})
        return Response(serializer.data)