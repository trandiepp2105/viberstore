# marketing_app/services.py
import logging
from typing import List, Dict, Any, Optional, Tuple
from django.db import transaction, models, IntegrityError
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model

# Import models from this app and related apps
from .models import (
    Promotion, ProductPromotion, CategoryPromotion, Coupon, CouponUsage
)
from product.models import Product, Category
from order.models import Order
from user.models import User
from .enums import PromotionType

logger = logging.getLogger(__name__)

# --- Promotion Services ---
class PromotionService:

    @staticmethod
    @transaction.atomic
    def create_promotion(data: Dict[str, Any]) -> Promotion:
        """Creates a new Promotion."""
        try:
            # Ensure 'value' and amounts are treated as integers
            promotion = Promotion.objects.create(**data)
            logger.info(f"Promotion '{promotion.name}' created with ID: {promotion.pk}")
            return promotion
        except IntegrityError as e:
            logger.error(f"Integrity error creating promotion: {e}. Data: {data}", exc_info=True)
            raise ValueError(f"Could not create promotion. Integrity error: {e}") from e
        except Exception as e:
            logger.error(f"Error creating promotion: {e}. Data: {data}", exc_info=True)
            raise RuntimeError("Could not create promotion.") from e

    @staticmethod
    @transaction.atomic
    def update_promotion(promotion_id: int, data: Dict[str, Any]) -> Promotion:
        """Updates an existing Promotion."""
        try:
            promotion = Promotion.objects.get(pk=promotion_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Promotion with ID {promotion_id} not found.")

        # Update fields
        has_changes = False
        allowed_fields = ['name', 'description', 'type', 'value', 'start_date',
                          'end_date', 'max_discount_amount', 'min_order_amount',
                          'usage_limit', 'priority', 'is_active']
        for field in allowed_fields:
            if field in data and getattr(promotion, field) != data[field]:
                setattr(promotion, field, data[field])
                has_changes = True

        if has_changes:
            # updated_at is auto_now=True
            try:
                 promotion.full_clean() # Run model validation
                 promotion.save()
                 logger.info(f"Promotion {promotion_id} updated.")
            except ValidationError as e:
                logger.warning(f"Validation error updating promotion {promotion_id}: {e.dict()}")
                # Raise ValueError for API layer to catch as 400
                raise ValueError(f"Validation Error: {e.message_dict}") from e
            except Exception as e:
                logger.error(f"Error updating promotion {promotion_id}: {e}", exc_info=True)
                raise RuntimeError(f"Could not update promotion {promotion_id}.") from e
        else:
            logger.info(f"No changes detected for Promotion {promotion_id}.")

        return promotion

    @staticmethod
    def get_promotion_by_id(promotion_id: int) -> Optional[Promotion]:
        """Gets a Promotion by ID."""
        try:
            return Promotion.objects.prefetch_related(
                 'productpromotion_set__product',
                 'categorypromotion_set__category'
            ).get(pk=promotion_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def list_promotions(filters: Optional[Dict[str, Any]] = None) -> models.QuerySet[Promotion]:
        """Lists Promotions with optional filters."""
        queryset = Promotion.objects.all()
        if filters:
            is_active = filters.get('is_active') # Expects bool
            promo_type = filters.get('type')
            now = timezone.now()
            active_now = filters.get('active_now') # Custom filter: bool

            if is_active is not None:
                 queryset = queryset.filter(is_active=is_active)
            if promo_type:
                 # Optional: Validate promo_type against PromotionType enum choices
                 if promo_type in PromotionType.values:
                      queryset = queryset.filter(type=promo_type)
                 else:
                      logger.warning(f"Invalid promotion type filter: {promo_type}")
            if active_now is True:
                 queryset = queryset.filter(is_active=True, start_date__lte=now, end_date__gte=now)
            # Add other filters

        return queryset.order_by('-priority', '-created_at')

    @staticmethod
    @transaction.atomic
    def delete_promotion(promotion_id: int) -> bool:
        """Deletes a Promotion."""
        try:
            promotion = Promotion.objects.get(pk=promotion_id)
            promo_name = promotion.name
            promotion.delete()
            logger.info(f"Promotion '{promo_name}' (ID: {promotion_id}) deleted.")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"Attempted to delete non-existent Promotion with ID: {promotion_id}")
            return False
        except Exception as e:
            logger.error(f"Error deleting promotion {promotion_id}: {e}", exc_info=True)
            raise RuntimeError(f"Could not delete promotion {promotion_id}.") from e

    @staticmethod
    @transaction.atomic
    def assign_promotion(data: Dict[str, Any]):
        """Assigns a promotion to products and/or categories."""
        promotion_id = data['promotion_id']
        product_ids = list(set(data.get('product_ids', []))) # Ensure unique IDs
        category_ids = list(set(data.get('category_ids', [])))

        try:
            promotion = Promotion.objects.get(pk=promotion_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Promotion with ID {promotion_id} not found.")

        # Assign to Products
        if product_ids:
            valid_products = Product.objects.filter(pk__in=product_ids)
            if valid_products.count() != len(product_ids):
                logger.warning(f"Assign Promotion {promotion_id}: Found invalid product IDs.")

            to_create = []
            existing_links = set(ProductPromotion.objects.filter(
                promotion=promotion, product_id__in=product_ids
            ).values_list('product_id', flat=True))

            for product in valid_products:
                 if product.id not in existing_links:
                      to_create.append(ProductPromotion(promotion=promotion, product=product))

            if to_create:
                 ProductPromotion.objects.bulk_create(to_create)
                 logger.info(f"Assigned Promotion {promotion_id} to {len(to_create)} products.")

        # Assign to Categories
        if category_ids:
            valid_categories = Category.objects.filter(pk__in=category_ids)
            if valid_categories.count() != len(category_ids):
                 logger.warning(f"Assign Promotion {promotion_id}: Found invalid category IDs.")

            to_create = []
            existing_links = set(CategoryPromotion.objects.filter(
                promotion=promotion, category_id__in=category_ids
            ).values_list('category_id', flat=True))

            for category in valid_categories:
                 if category.id not in existing_links:
                      to_create.append(CategoryPromotion(promotion=promotion, category=category))

            if to_create:
                 CategoryPromotion.objects.bulk_create(to_create)
                 logger.info(f"Assigned Promotion {promotion_id} to {len(to_create)} categories.")

    @staticmethod
    @transaction.atomic
    def remove_promotion_assignments(data: Dict[str, Any]):
        """Removes promotion assignments from products/categories."""
        promotion_id = data['promotion_id']
        product_ids = data.get('product_ids', [])
        category_ids = data.get('category_ids', [])

        try:
            promotion = Promotion.objects.get(pk=promotion_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Promotion with ID {promotion_id} not found.")

        deleted_products_count = 0
        if product_ids:
            deleted_products_count, _ = ProductPromotion.objects.filter(
                promotion=promotion, product_id__in=product_ids
            ).delete()
            if deleted_products_count > 0:
                 logger.info(f"Removed Promotion {promotion_id} assignment from {deleted_products_count} products.")

        deleted_categories_count = 0
        if category_ids:
            deleted_categories_count, _ = CategoryPromotion.objects.filter(
                promotion=promotion, category_id__in=category_ids
            ).delete()
            if deleted_categories_count > 0:
                 logger.info(f"Removed Promotion {promotion_id} assignment from {deleted_categories_count} categories.")

        return deleted_products_count, deleted_categories_count


# --- Coupon Services ---
class CouponService:

    @staticmethod
    def _normalize_code(code: str) -> str:
        return code.strip().upper()

    @staticmethod
    @transaction.atomic
    def create_coupon(data: Dict[str, Any]) -> Coupon:
        """Creates a new Coupon."""
        code = CouponService._normalize_code(data.get('code', ''))
        if not code: raise ValueError("Coupon code cannot be empty.")
        data['code'] = code # Use normalized code

        # Check uniqueness case-insensitively before create
        if Coupon.objects.filter(code__iexact=code).exists():
            raise ValueError(f"Coupon code '{code}' already exists.")

        try:
            coupon = Coupon.objects.create(**data)
            logger.info(f"Coupon '{coupon.code}' created with ID: {coupon.pk}")
            return coupon
        except IntegrityError as e:
            logger.error(f"Integrity error creating coupon: {e}. Data: {data}", exc_info=True)
            raise ValueError(f"Could not create coupon. Integrity error: {e}") from e
        except Exception as e:
            logger.error(f"Error creating coupon: {e}. Data: {data}", exc_info=True)
            raise RuntimeError("Could not create coupon.") from e

    @staticmethod
    @transaction.atomic
    def update_coupon(coupon_id: int, data: Dict[str, Any]) -> Coupon:
        """Updates an existing Coupon."""
        try:
            coupon = Coupon.objects.get(pk=coupon_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Coupon with ID {coupon_id} not found.")

        # Normalize and check code uniqueness if provided
        if 'code' in data:
            new_code = CouponService._normalize_code(data['code'])
            if not new_code: raise ValueError("Coupon code cannot be empty.")
            if new_code != coupon.code: # Only check if code actually changed
                if Coupon.objects.filter(code__iexact=new_code).exclude(pk=coupon_id).exists():
                     raise ValueError(f"Coupon code '{new_code}' already exists.")
            data['code'] = new_code # Update data with normalized code

        # Update fields
        has_changes = False
        allowed_fields = [
            'code', 'description', 'type', 'value', 'min_order_amount',
            'max_discount_amount', 'start_date', 'end_date',
            'usage_limit_per_user', 'usage_limit_per_coupon', 'is_active'
        ]
        for field in allowed_fields:
             # Use pop to remove the field from data if it exists, handle its update
             if field in data:
                 new_value = data.pop(field) # Remove from data dict

                 if getattr(coupon, field) != new_value:
                     setattr(coupon, field, new_value)
                     has_changes = True
        # If data still has keys, they are unexpected
        if data:
            logger.warning(f"Unexpected fields found during coupon update: {list(data.keys())}")


        if has_changes:
            # updated_at is auto_now=True
            try:
                 coupon.full_clean()
                 coupon.save()
                 logger.info(f"Coupon {coupon_id} updated.")
            except ValidationError as e:
                 logger.warning(f"Validation error updating coupon {coupon_id}: {e.dict()}")
                 raise ValueError(f"Validation Error: {e.message_dict}") from e
            except Exception as e:
                 logger.error(f"Error updating coupon {coupon_id}: {e}", exc_info=True)
                 raise RuntimeError(f"Could not update coupon {coupon_id}.") from e
        else:
             logger.info(f"No changes detected for Coupon {coupon_id}.")

        return coupon

    @staticmethod
    def get_coupon_by_id(coupon_id: int) -> Optional[Coupon]:
        """Gets a Coupon by ID."""
        try:
            return Coupon.objects.get(pk=coupon_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def get_coupon_by_code(code: str) -> Optional[Coupon]:
        """Gets a Coupon by code (case-insensitive)."""
        try:
             return Coupon.objects.get(code__iexact=CouponService._normalize_code(code))
        except ObjectDoesNotExist:
             return None

    @staticmethod
    def list_coupons(filters: Optional[Dict[str, Any]] = None) -> models.QuerySet[Coupon]:
        """Lists Coupons with optional filters."""
        queryset = Coupon.objects.all()
        if filters:
            is_active = filters.get('is_active') # Expects bool
            code_search = filters.get('code')
            now = timezone.now()
            active_now = filters.get('active_now') # Custom filter: bool
            type = filters.get('type') # Optional: Validate against PromotionType enum
            if is_active is not None:
                 queryset = queryset.filter(is_active=is_active)
            if code_search:
                 # Ensure search is also case-insensitive and normalized
                 queryset = queryset.filter(code__icontains=CouponService._normalize_code(code_search))
            if active_now is True:
                 queryset = queryset.filter(is_active=True, start_date__lte=now, end_date__gte=now)
            if type:
                 # Validate promo_type against PromotionType enum choices
                 if type in [choice[0] for choice in PromotionType.choices()]:
                      queryset = queryset.filter(type=type)
                 else:
                      logger.warning(f"Invalid coupon type filter: {type}")
            # Add other filters

        return queryset.order_by('-created_at')

    @staticmethod
    @transaction.atomic
    def delete_coupon(coupon_id: int) -> bool:
        """Deletes a Coupon."""
        try:
            coupon = Coupon.objects.get(pk=coupon_id)
            coupon_code = coupon.code
            coupon.delete()
            logger.info(f"Coupon '{coupon_code}' (ID: {coupon_id}) deleted.")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"Attempted to delete non-existent Coupon with ID: {coupon_id}")
            return False
        except Exception as e:
            logger.error(f"Error deleting coupon {coupon_id}: {e}", exc_info=True)
            raise RuntimeError(f"Could not delete coupon {coupon_id}.") from e

    @staticmethod
    def get_valid_coupons_by_ids(coupon_ids: List[int]) -> models.QuerySet[Coupon]:
        """Gets valid coupons by IDs."""
        now = timezone.now()
        return Coupon.objects.filter(
            pk__in=coupon_ids,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).order_by('-created_at')

    @staticmethod
    def get_free_shipping_coupons() -> models.QuerySet[Coupon]:
        """Gets all active free shipping coupons."""
        now = timezone.now()
        return Coupon.objects.filter(
            isc_active=True,
            start_date__lte=now,
            end_date__gte=now,
            type=PromotionType.FREE_SHIPPING
        ).order_by('-created_at')

    @staticmethod
    def calculate_discount(coupons, order_amount: int) -> int:
        """
        Calculates the total discount amount based on the list of coupons and order amount.
        Returns the total discount amount as an integer.
        """
        total_discount = 0

        for coupon in coupons:
            discount = 0
            # Check if order_amount meets the coupon's minimum order amount
            if coupon.min_order_amount is not None and order_amount < coupon.min_order_amount:
                continue  # Skip this coupon if the condition is not met

            if coupon.type == PromotionType.FIXED.value:
                discount = min(coupon.value, order_amount)

            elif coupon.type == PromotionType.PERCENTAGE.value:
                discount = (order_amount * coupon.value) // 100
                if coupon.max_discount_amount is not None:
                    discount = min(discount, coupon.max_discount_amount)


            # Check max_discount_value (if applicable)
            if hasattr(coupon, 'max_discount_value') and coupon.max_discount_value is not None:
                discount = min(discount, coupon.max_discount_value)

            total_discount += discount

        return min(total_discount, order_amount)  # Ensure total discount does not exceed order amount

    @staticmethod
    def validate_coupon(user: User, code: str, order_amount: Optional[int] = None) -> Dict[str, Any]:
        """
        Validates a coupon code for a user and optional order amount.
        Returns a dictionary with validation status and details.
        """
        normalized_code = CouponService._normalize_code(code)
        coupon = CouponService.get_coupon_by_code(normalized_code)
        now = timezone.now()
        # Default response
        response = {
            "is_valid": False,
            "message": "Invalid coupon code.",
            "discount_amount": None,
            "coupon_id": None,
            "final_amount": order_amount # Pass original amount through
        }

        if not coupon:
            logger.info(f"Validation failed for User {user.pk}: Coupon '{normalized_code}' not found.")
            return response

        response["coupon_id"] = coupon.pk

        # --- Check Conditions ---
        if not coupon.is_active:
            response["message"] = "This coupon is currently inactive."
            logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Inactive.")
            return response
        if coupon.start_date > now:
            response["message"] = f"This coupon is not valid until {coupon.start_date.strftime('%Y-%m-%d %H:%M')}."
            logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Not started.")
            return response
        if coupon.end_date < now:
            response["message"] = "This coupon has expired."
            logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Expired.")
            return response

        # Check total usage limit *before* potentially hitting the DB for user usage
        if coupon.usage_limit_per_coupon is not None and coupon.current_usage >= coupon.usage_limit_per_coupon:
            response["message"] = "This coupon's usage limit has been reached."
            logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Total limit reached ({coupon.current_usage}/{coupon.usage_limit_per_coupon}).")
            return response

        # Check per-user limit
        if coupon.usage_limit_per_user is not None:
            # Optimize: Check if limit is 0 or less first
            if coupon.usage_limit_per_user <= 0:
                 response["message"] = "Coupon cannot be used." # Or specific message
                 logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Per-user limit is zero or negative.")
                 return response
            user_usage_count = CouponUsage.objects.filter(user=user, coupon=coupon).count()
            if user_usage_count >= coupon.usage_limit_per_user:
                response["message"] = "You have already used this coupon the maximum number of times."
                logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: User limit reached ({user_usage_count}/{coupon.usage_limit_per_user}).")
                return response

        # Check minimum order amount
        if coupon.min_order_amount is not None and order_amount is not None:
            if order_amount < coupon.min_order_amount:
                response["message"] = f"Your order total must be at least {coupon.min_order_amount} to use this coupon."
                logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Min order amount not met ({order_amount}/{coupon.min_order_amount}).")
                return response
        elif coupon.min_order_amount is not None and order_amount is None:
             # Cannot validate min amount without order amount provided
             response["message"] = "Cannot validate minimum order amount without order total."
             logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Order amount needed for min check.")
             return response


        # --- Calculate Discount ---
        discount = 0
        value = coupon.value
        coupon_type = coupon.type

        if coupon_type == PromotionType.ORDER_FIXED_AMOUNT:
            discount = value
        elif coupon_type == PromotionType.ORDER_PERCENTAGE:
            if order_amount is not None and order_amount > 0: # Ensure order_amount is valid for percentage
                discount = (order_amount * value) // 100
                if coupon.max_discount_amount is not None:
                    discount = min(discount, coupon.max_discount_amount)
            else:
                # Cannot apply percentage discount without a positive order amount
                response["message"] = "Cannot apply percentage coupon without a valid order total."
                logger.info(f"Validation failed for User {user.pk}, Coupon {coupon.code}: Order amount needed/invalid for percentage calc.")
                return response

        discount = max(0, discount)
        if order_amount is not None:
            discount = min(discount, order_amount)

        response["is_valid"] = True
        response["message"] = "Coupon applied successfully."
        response["discount_amount"] = discount
        if order_amount is not None:
            response["final_amount"] = order_amount - discount

        logger.info(f"Coupon '{normalized_code}' validated for User {user.pk}. Valid: True, Discount: {discount}")
        return response

    @staticmethod
    @transaction.atomic
    def record_coupon_usage(user: User, coupon: Coupon, order: Order) -> CouponUsage:
        """
        Records coupon usage for an order and increments the coupon's usage count.
        """
        if not all([user, coupon, order]):
            raise ValueError("User, Coupon, and Order must be provided to record usage.")

        # Re-fetch coupon within transaction with lock for update
        try:
            coupon_for_update = Coupon.objects.select_for_update().get(pk=coupon.pk)
        except ObjectDoesNotExist:
            logger.error(f"Coupon {coupon.pk} not found during usage recording for Order {order.order_code}.")
            raise ValidationError("Coupon not found or was deleted.") # Fail transaction

        # --- Re-validate crucial conditions within transaction ---
        if not coupon_for_update.is_active:
             raise ValidationError("Coupon is no longer active.")
        now = timezone.now()
        if coupon_for_update.start_date > now or coupon_for_update.end_date < now:
             raise ValidationError("Coupon has expired or is not yet valid.")

        # Check total usage limit again (atomically with select_for_update)
        if coupon_for_update.usage_limit_per_coupon is not None and \
           coupon_for_update.current_usage >= coupon_for_update.usage_limit_per_coupon:
            logger.warning(f"Coupon {coupon.code} usage limit reached before usage could be recorded for order {order.order_code}.")
            raise ValidationError("Coupon usage limit has been reached.") # Fail transaction

        # Check per-user limit again within transaction
        if coupon_for_update.usage_limit_per_user is not None:
            # Lock potentially related Usage rows? Less critical than coupon lock usually.
            user_usage_count = CouponUsage.objects.filter(user=user, coupon=coupon_for_update).count()
            if user_usage_count >= coupon_for_update.usage_limit_per_user:
                 logger.warning(f"Attempted to record usage for coupon {coupon.code} by user {user.pk} exceeding per-user limit (checked inside transaction).")
                 raise ValidationError("Coupon usage limit per user exceeded.") # Fail transaction

        # --- Perform updates ---
        # Increment coupon usage count
        coupon_for_update.current_usage += 1
        coupon_for_update.save(update_fields=['current_usage', 'updated_at']) # updated_at is auto_now
        # Reload to get the actual new value if needed later
        # coupon_for_update.refresh_from_db(fields=['current_usage'])

        # Create the usage record
        try:
            usage_record = CouponUsage.objects.create(
                user=user,
                coupon=coupon_for_update, # Use the locked instance
                order=order
            )
            logger.info(f"Recorded usage for Coupon '{coupon_for_update.code}' by User {user.pk} on Order {order.order_code}. New count: {coupon_for_update.current_usage + 1}") # Log expected new count
            return usage_record
        except Exception as e:
            logger.error(f"Error creating CouponUsage record for Coupon {coupon.code}, User {user.pk}, Order {order.order_code}: {e}", exc_info=True)
            # The transaction will rollback due to the exception
            raise RuntimeError("Failed to create coupon usage record.") from e


# --- Coupon Usage Services ---
class CouponUsageService:
    @staticmethod
    def list_coupon_usage(filters: Optional[Dict[str, Any]] = None) -> models.QuerySet[CouponUsage]:
        """Lists coupon usage records (for Admin)."""
        queryset = CouponUsage.objects.select_related('user', 'coupon', 'order').all()
        if filters:
             user_id = filters.get('user_id')
             coupon_id = filters.get('coupon_id')
             order_id = filters.get('order_id')
             # Add date range filter on used_at if needed

             if user_id:
                 try: queryset = queryset.filter(user_id=int(user_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid user_id filter for coupon usage: {user_id}")
             if coupon_id:
                 try: queryset = queryset.filter(coupon_id=int(coupon_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid coupon_id filter for coupon usage: {coupon_id}")
             if order_id:
                 try: queryset = queryset.filter(order_id=int(order_id))
                 except (ValueError, TypeError): logger.warning(f"Invalid order_id filter for coupon usage: {order_id}")

        return queryset.order_by('-used_at')