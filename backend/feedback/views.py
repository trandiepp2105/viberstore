# feedback_app/views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .services import ReviewService
from .serializers import ReviewSerializer, ReviewStatusUpdateSerializer
from .enums import ReviewStatus
# from .permissions import IsAdminUser, ReadOnly # Or use DRF's built-ins

logger = logging.getLogger(__name__)


# --- Review Views ---

class ReviewListCreateAPIView(APIView):
    """
    List reviews (Public sees Approved, Admin sees all/filtered)
    or create a new review (Authenticated users for their own orders).
    """
    # Permissions handled dynamically
    serializer_class = ReviewSerializer # Hint for swagger

    def get_permissions(self):
        if self.request.method == 'POST':
             # Must be logged in to create a review
             return [permissions.IsAuthenticated()]
        # Anyone can attempt to list reviews (logic inside GET handles filtering)
        return [permissions.AllowAny()]

    @swagger_auto_schema(
        operation_summary="List Reviews",
        operation_description="Retrieves a list of reviews. Public users see only APPROVED reviews. Admins can see all and filter by 'status', 'product_id', 'user_id', 'order_id', 'min_rating'.",
        manual_parameters=[
            openapi.Parameter('product_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter('user_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter('order_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter(
                'status',
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                # Sửa ở đây: Dùng list comprehension để lấy values
                enum=[status.value for status in ReviewStatus],
                description="(Admin only) Filter by status"
            ),            
            openapi.Parameter('min_rating', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Minimum rating (1-5)"),
        ],
        responses={
            200: openapi.Response(
                description="List of reviews",
                examples={
                    "application/json": [
                        {
                            "id": 1,
                            "user": 1,
                            "product": 1,
                            "order": 1,
                            "rating": 5,
                            "comment": "Great product!",
                            "status": ReviewStatus.APPROVED.value,
                            "created_at": "2023-01-01T00:00:00Z",
                            "updated_at": "2023-01-01T00:00:00Z"
                        }
                    ]
                }
            ),
            400: "Bad request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not found",
            500: "Internal server error"
        },
        tags=['Reviews']
    )
    def get(self, request, format=None):
        try:
            filters = {
                'product_id': request.query_params.get('product_id'),
                'user_id': request.query_params.get('user_id'),
                'order_id': request.query_params.get('order_id'),
                'status': request.query_params.get('status'),
                'min_rating': request.query_params.get('min_rating'),
            }
            filters = {k: v for k, v in filters.items() if v is not None}

            # Pass requesting user to service for permission-based filtering
            reviews = ReviewService.list_reviews(filters=filters, requesting_user=request.user)
            # Add pagination here if expecting many reviews
            serializer = self.serializer_class(reviews, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
             logger.error(f"Error listing reviews: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Create Review",
        operation_description="Creates a new review for a product in a specific order placed by the authenticated user.",
        request_body=ReviewSerializer, # Uses main serializer for input schema hint (excluding read-only fields)
        responses={
            201: openapi.Response(
                description="Review created successfully",
                examples={
                    "application/json": {
                        "id": 1,
                        "user": 1,
                        "product": 1,
                        "order": 1,
                        "rating": 5,
                        "comment": "Great product!",
                        "status": ReviewStatus.PENDING.value,
                        "created_at": "2023-01-01T00:00:00Z",
                        "updated_at": "2023-01-01T00:00:00Z"
                    }
                }
            ),
            400: openapi.Response(description="Bad request (validation error)"),
            402: openapi.Response(description="Payment required (if applicable)"),
            401: openapi.Response(description="Unauthorized"),
        },
        security=[{'Bearer': []}], tags=['Reviews']
    )
    def post(self, request, format=None):
        # Permissions check done by get_permissions
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                # Service handles validation (ownership, product in order, duplicates) and sets user
                review = ReviewService.create_review(
                    user=request.user,
                    data=serializer.validated_data # Pass validated dict
                )
                response_serializer = self.serializer_class(review, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, ValidationError) as e: # Catch service validation/logic errors
                logger.warning(f"Failed to create review for user {request.user.pk}: {e}. Data: {request.data}")
                # Determine status code based on error type if needed (e.g., PermissionDenied -> 403)
                status_code = status.HTTP_403_FORBIDDEN if isinstance(e, PermissionDenied) else status.HTTP_400_BAD_REQUEST
                return Response({"error": str(e)}, status=status_code)
            except IntegrityError: # Should be caught by service ideally, but fallback
                 logger.warning(f"Duplicate review constraint hit for user {request.user.pk}. Data: {request.data}")
                 return Response({"error": "You have already submitted a review for this product on this order."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 logger.error(f"Unexpected error creating review for user {request.user.pk}: {e}", exc_info=True)
                 return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewDetailAPIView(APIView):
    """
    Retrieve, update (comment/rating by owner), or delete (owner or admin) a review.
    Public can view APPROVED reviews. Admins/Owners can view any status.
    """
    serializer_class = ReviewSerializer

    def get_permissions(self):
        # Allow read access based on status check within GET method
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        # Require authentication for update/delete
        return [permissions.IsAuthenticated()]

    def _get_object(self, pk):
        review = ReviewService.get_review_by_id(pk)
        if review is None:
            raise Http404("Review not found.")
        return review

    @swagger_auto_schema(
        operation_summary="Retrieve Review",
        operation_description="Retrieves details of a specific review. Only APPROVED reviews are visible to the public unless requested by the owner or an admin.",
        responses={
            200: openapi.Response(
                description="Review details",
                examples={
                    "application/json": {
                        "id": 1,
                        "user": 1,
                        "product": 1,
                        "order": 1,
                        "rating": 5,
                        "comment": "Great product!",
                        "status": ReviewStatus.APPROVED.value,
                        "created_at": "2023-01-01T00:00:00Z",
                        "updated_at": "2023-01-01T00:00:00Z"
                    }
                }
            ),
            400: openapi.Response(description="Bad request"),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden (not owner/admin)"),
            404: openapi.Response(description="Not found"),
            500: openapi.Response(description="Internal server error")
        },
        tags=['Reviews']
    )
    def get(self, request, pk, format=None):
        try:
            review = self._get_object(pk)
            is_owner = request.user == review.user
            is_admin = request.user.is_authenticated and request.user.is_staff

            # Check if viewable
            if review.status == ReviewStatus.APPROVED or is_owner or is_admin:
                 serializer = self.serializer_class(review, context={'request': request})
                 return Response(serializer.data)
            else:
                 # Not approved and user is not owner/admin -> treat as not found
                 logger.info(f"Access denied for Review {pk} (Status: {review.status}) by User {request.user.pk if request.user.is_authenticated else 'Anonymous'}")
                 raise Http404("Review not found.") # Return 404 for non-approved reviews to public

        except Http404 as e:
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error retrieving review {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Review (Owner Only)",
        operation_description="Updates the rating and/or comment of a review. Only the owner can perform this action. Status cannot be changed here.",
        request_body=openapi.Schema(
             type=openapi.TYPE_OBJECT,
             properties={
                 'rating': openapi.Schema(type=openapi.TYPE_INTEGER, minimum=1, maximum=5, nullable=True),
                 'comment': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
             }
        ),
        responses={
            200: openapi.Response(
                description="Review updated successfully",
                examples={
                    "application/json": {
                        "id": 1,
                        "user": 1,
                        "product": 1,
                        "order": 1,
                        "rating": 5,
                        "comment": "Updated comment",
                        "status": ReviewStatus.PENDING.value,
                        "created_at": "2023-01-01T00:00:00Z",
                        "updated_at": "2023-01-01T00:00:00Z"
                    }
                }
            ),
            400: openapi.Response(description="Bad request (validation error)"),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden (not owner)"),
            404: openapi.Response(description="Not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Reviews']
    )
    def put(self, request, pk, format=None): # Use PUT/PATCH for user updates
        try:
            # Service layer will check ownership inside update_review
            # Use serializer to validate rating/comment input format
            # Fetch instance first to pass to serializer for partial validation context
            instance = self._get_object(pk)
            # Allow partial updates implicitly with PATCH, enforce required fields for PUT if desired
            serializer = self.serializer_class(instance, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                try:
                    # Pass only rating and comment to service
                    update_data = {}
                    if 'rating' in serializer.validated_data:
                        update_data['rating'] = serializer.validated_data['rating']
                    if 'comment' in serializer.validated_data:
                         update_data['comment'] = serializer.validated_data['comment']

                    if not update_data: # Nothing to update
                        return Response(serializer.data) # Return current data

                    # Service checks ownership
                    updated_review = ReviewService.update_review(pk, request.user, update_data)
                    response_serializer = self.serializer_class(updated_review, context={'request': request})
                    return Response(response_serializer.data)
                except PermissionDenied as e:
                    return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
                except (ValueError, ValidationError) as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                     logger.error(f"Error updating review {pk} by user {request.user.pk}: {e}", exc_info=True)
                     return Response({"error": "Could not update review."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error processing PUT/PATCH for review {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(auto_schema=None) # Hide PATCH if logic is same as PUT
    def patch(self, request, pk, format=None):
         return self.put(request, pk, format)

    @swagger_auto_schema(
        operation_summary="Delete Review (Owner or Admin)",
        operation_description="Deletes a specific review. Can be performed by the review owner or an administrator.",
        responses={
            204: openapi.Response(description="Review deleted successfully"),
            400: openapi.Response(description="Bad request"),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden (not owner/admin)"),
            404: openapi.Response(description="Not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Reviews']
    )
    def delete(self, request, pk, format=None):
        try:
            # Service checks ownership or admin status
            success = ReviewService.delete_review(pk, request.user)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                 # Should not happen if service raises PermissionDenied/ValueError correctly
                 return Response({"error": "Review not found or could not be deleted."}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
             return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e: # Catch "Not Found" from service delete attempt
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting review {pk} by user {request.user.pk}: {e}", exc_info=True)
             return Response({"error": "Could not delete review."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminReviewUpdateStatusAPIView(APIView):
    """Admin-only endpoint to update the status of a review."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ReviewStatusUpdateSerializer # Use dedicated serializer for input

    @swagger_auto_schema(
        operation_summary="Update Review Status (Admin Only)",
        operation_description="Updates the status ('pending', 'approved', 'rejected') of a specific review.",
        request_body=ReviewStatusUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Review status updated successfully",
                examples={
                    "application/json": {
                        "id": 1,
                        "user": 1,
                        "product": 1,
                        "order": 1,
                        "rating": 5,
                        "comment": "Great product!",
                        "status": ReviewStatus.APPROVED.value,
                        "created_at": "2023-01-01T00:00:00Z",
                        "updated_at": "2023-01-01T00:00:00Z"
                    }
                }
            ),
            400: openapi.Response(description="Bad request (validation error)"),
            401: openapi.Response(description="Unauthorized"),
            403: openapi.Response(description="Forbidden (not admin)"),
            404: openapi.Response(description="Not found"),
            500: openapi.Response(description="Internal server error")
        },
        security=[{'Bearer': []}], tags=['Reviews (Admin Actions)']
    )
    def patch(self, request, pk, format=None): # Use PATCH for status update
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            try:
                updated_review = ReviewService.update_review_status(
                    review_id=pk,
                    new_status_code=new_status,
                    admin_user=request.user
                )
                response_serializer = ReviewSerializer(updated_review, context={'request': request})
                return Response(response_serializer.data)
            except (ValueError, ValidationError) as e:
                status_code = status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() else status.HTTP_400_BAD_REQUEST
                logger.warning(f"Admin {request.user.pk} failed to update status for review {pk}: {e}. Status: {new_status}")
                return Response({"error": str(e)}, status=status_code)
            except PermissionDenied as e: # Should not happen due to permission_classes, but good practice
                return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                 logger.error(f"Admin {request.user.pk} unexpected error updating status for review {pk}: {e}", exc_info=True)
                 return Response({"error": "Could not update review status."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)