# feedback_app/services.py
import logging
from typing import List, Dict, Any, Optional, Tuple
from django.db import transaction, models, IntegrityError
from django.core.exceptions import ObjectDoesNotExist, ValidationError, PermissionDenied
from django.utils import timezone
from django.contrib.auth import get_user_model

from feedback.models import Review
from feedback.enums import ReviewStatus
# Import related models
from product.models import Product
from order.models import Order, OrderItem
from user.models import User

# import queryset for filtering
from django.db.models import QuerySet

logger = logging.getLogger(__name__)


class ReviewService:

    @staticmethod
    def _validate_review_permission(user: User, product: Product, order: Order):
        """Checks if the user placed the order and if the product is in that order."""
        if order.user != user:
            raise PermissionDenied("You can only review products from your own orders.")

        # Check if the product exists within the order items
        if not OrderItem.objects.filter(order=order, variant__product=product).exists():
             raise ValidationError(f"Product '{product.name}' was not found in order '{order.order_code}'.")

    @staticmethod
    @transaction.atomic
    def create_review(user: User, data: Dict[str, Any]) -> Review:
        """Creates a new review after validation."""
        product_id = data.get('product') # Expecting Product object from serializer
        order_id = data.get('order')     # Expecting Order object from serializer
        rating = data.get('rating')
        comment = data.get('comment')

        if not product_id or not order_id:
             raise ValueError("Product and Order are required.")

        # Fetch objects (serializer already validated existence)
        product = product_id # It's already the object
        order = order_id     # It's already the object

        # --- Crucial Validation ---
        try:
            ReviewService._validate_review_permission(user, product, order)
        except (PermissionDenied, ValidationError) as e:
            # Re-raise as ValueError for the API view to catch as 400/403
            raise ValueError(str(e)) from e

        # Check for existing review (UniqueConstraint handles this at DB level,
        # but checking here provides clearer API error)
        if Review.objects.filter(user=user, product=product, order=order).exists():
            raise ValueError("You have already submitted a review for this product on this order.")

        # Ensure rating/comment provided (serializer also checks this)
        if rating is None and not comment:
            raise ValueError("A review requires at least a rating or a comment.")

        try:
            review = Review.objects.create(
                user=user,
                product=product,
                order=order,
                rating=rating,
                comment=comment,
                status=ReviewStatus.PENDING # Always start as pending
            )
            logger.info(f"Review ID {review.pk} created by User {user.pk} for Product {product.pk} / Order {order.pk}")
            # Optional: Trigger notification to admin for approval
            return review
        except IntegrityError as e: # Catch potential UniqueConstraint violation again
             logger.warning(f"Integrity error creating review (likely duplicate): {e}. Data: {data}")
             raise ValueError("You have already submitted a review for this product on this order.") from e
        except Exception as e:
            logger.error(f"Error creating review for user {user.pk}: {e}", exc_info=True)
            raise RuntimeError("Could not create review.") from e


    @staticmethod
    @transaction.atomic
    def update_review(review_id: int, user: User, data: Dict[str, Any]) -> Review:
        """Updates rating/comment of a review owned by the user."""
        try:
            review = Review.objects.get(pk=review_id, user=user)
        except ObjectDoesNotExist:
            raise ValueError(f"Review with ID {review_id} not found or not owned by user.")

        # Only allow updating rating and comment
        has_changes = False
        if 'rating' in data and review.rating != data['rating']:
            review.rating = data['rating']
            has_changes = True
        if 'comment' in data and review.comment != data['comment']:
             review.comment = data['comment']
             has_changes = True

        # Ensure still valid (has rating or comment)
        if review.rating is None and not review.comment:
            raise ValueError("Cannot remove both rating and comment. Review must have at least one.")

        if has_changes:
             # updated_at is auto_now=True
             try:
                 review.full_clean() # Run model validation
                 review.save(update_fields=['rating', 'comment', 'updated_at'])
                 logger.info(f"Review ID {review_id} updated by User {user.pk}.")
             except ValidationError as e:
                  logger.warning(f"Validation error updating review {review_id}: {e.dict()}")
                  raise ValueError(f"Validation Error: {e.message_dict}") from e
             except Exception as e:
                 logger.error(f"Error updating review {review_id}: {e}", exc_info=True)
                 raise RuntimeError(f"Could not update review {review_id}.") from e
        else:
             logger.info(f"No changes detected for Review {review_id}.")

        return review

    @staticmethod
    @transaction.atomic
    def update_review_status(review_id: int, new_status_code: str, admin_user: User) -> Review:
        """Updates the status of a review (Admin action)."""
        if not admin_user or not admin_user.is_staff:
             raise PermissionDenied("Only administrators can update review status.")

        try:
            review = Review.objects.select_related('status').get(pk=review_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Review with ID {review_id} not found.")

        # Validate new status code
        if new_status_code not in ReviewStatus.values:
             raise ValueError(f"Invalid status code '{new_status_code}'. Valid options are: {ReviewStatus.values}")

        if review.status == new_status_code:
            logger.info(f"Review {review_id} already has status '{new_status_code}'. No update needed.")
            return review

        old_status = review.status
        review.status = new_status_code
        # updated_at is auto_now=True
        try:
             review.save(update_fields=['status', 'updated_at'])
             logger.info(f"Review {review_id} status changed from '{old_status}' to '{new_status_code}' by Admin {admin_user.pk}")
             # Optional: Add to a separate admin action log if needed
             # Optional: Trigger notification to the user about approval/rejection
             return review
        except Exception as e:
             logger.error(f"Error updating status for review {review_id}: {e}", exc_info=True)
             raise RuntimeError(f"Could not update review status for {review_id}.") from e


    @staticmethod
    @transaction.atomic
    def delete_review(review_id: int, user: User) -> bool:
        """Deletes a review. Allowed if user is owner or admin."""
        try:
            review = Review.objects.select_related('user').get(pk=review_id)
        except ObjectDoesNotExist:
            logger.warning(f"Attempted to delete non-existent Review ID {review_id} by User {user.pk}")
            return False # Not found

        # Check permission
        if review.user == user or user.is_staff:
            try:
                review_info = str(review) # Get info before deleting
                review.delete()
                logger.info(f"Review '{review_info}' (ID: {review_id}) deleted by User {user.pk} (is_staff={user.is_staff}).")
                return True
            except Exception as e:
                logger.error(f"Error deleting review {review_id}: {e}", exc_info=True)
                raise RuntimeError(f"Could not delete review {review_id}.") from e
        else:
            logger.warning(f"User {user.pk} permission denied attempting to delete Review {review_id} owned by {review.user.pk}.")
            raise PermissionDenied("You do not have permission to delete this review.")


    @staticmethod
    def get_review_by_id(review_id: int) -> Optional[Review]:
        """Gets a Review by ID with related user/product."""
        try:
            return Review.objects.select_related('user', 'product', 'order').get(pk=review_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def list_reviews(filters: Optional[Dict[str, Any]] = None, requesting_user: Optional[User] = None) -> QuerySet[Review]:
        """Lists reviews, filtering by status based on user role."""
        queryset = Review.objects.select_related('user', 'product', 'order').all()

        # Default filtering logic: Admins see all, others see only approved
        is_admin = requesting_user and requesting_user.is_authenticated and requesting_user.is_staff
        default_status = filters.pop('status', None) if filters else None # Allow admin to filter by status

        if not is_admin:
             # Non-admins always see only approved reviews
             queryset = queryset.filter(status=ReviewStatus.APPROVED)
             if default_status and default_status != ReviewStatus.APPROVED:
                  logger.warning(f"Non-admin user {requesting_user.pk if requesting_user else 'Anonymous'} requested status '{default_status}', but only '{ReviewStatus.APPROVED}' is allowed.")
                  # Return empty if they explicitly asked for a non-approved status? Or just ignore? Ignore is simpler.
        elif default_status:
            # Admin can filter by any status
            if default_status in ReviewStatus.values:
                 queryset = queryset.filter(status=default_status)
            else:
                 logger.warning(f"Admin requested invalid status filter: {default_status}")


        # Apply other filters
        if filters:
            product_id = filters.get('product_id')
            user_id = filters.get('user_id')
            order_id = filters.get('order_id')
            min_rating = filters.get('min_rating')

            if product_id:
                 try: queryset = queryset.filter(product_id=int(product_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid product_id filter: {product_id}")
            if user_id:
                 try: queryset = queryset.filter(user_id=int(user_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid user_id filter: {user_id}")
            if order_id:
                 try: queryset = queryset.filter(order_id=int(order_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid order_id filter: {order_id}")
            if min_rating:
                 try:
                      rating = int(min_rating)
                      if 1 <= rating <= 5:
                           queryset = queryset.filter(rating__gte=rating)
                      else: logger.warning(f"Invalid min_rating filter value: {min_rating}")
                 except (ValueError, TypeError): logger.warning(f"Invalid min_rating filter format: {min_rating}")


        return queryset.order_by('-created_at')