# marketing_app/serializers.py
import logging
from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal # Import Decimal, especially if using DecimalField
from typing import List
# Import models from this app
from .models import (
    Promotion, ProductPromotion, CategoryPromotion, Coupon, CouponUsage
)
# Import models from other apps for relationships/validation
from product.models import Product, Category
from order.models import Order
from user.models import User # Or from django.contrib.auth import get_user_model
# Import Enum
from .enums import PromotionType

logger = logging.getLogger(__name__)

# --- Promotion Serializer ---
class PromotionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    # Consider DecimalField if model changes
    # value = serializers.DecimalField(max_digits=10, decimal_places=2)
    # max_discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    # min_order_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    # Fields to show related products/categories (read-only, IDs only for simplicity)
    # These query the through models
    applied_product_ids = serializers.SerializerMethodField(read_only=True)
    applied_category_ids = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Promotion
        fields = [
            'id', 'name', 'description', 'type', 'type_display', 'value',
            'start_date', 'end_date', 'max_discount_amount', 'min_order_amount',
            'usage_limit', 'current_usage', 'priority', 'is_active',
            'applied_product_ids', 'applied_category_ids', # Read-only IDs
            'created_at', 'updated_at'
        ]
        read_only_fields = (
            'id', 'type_display', 'current_usage', 'applied_product_ids',
            'applied_category_ids', 'created_at', 'updated_at'
        )

    def get_applied_product_ids(self, obj: Promotion) -> List[int]:
        return list(ProductPromotion.objects.filter(promotion=obj).values_list('product_id', flat=True))

    def get_applied_category_ids(self, obj: Promotion) -> List[int]:
        return list(CategoryPromotion.objects.filter(promotion=obj).values_list('category_id', flat=True))

    def validate(self, data):
        """ Add cross-field validation. """
        start = data.get('start_date', getattr(self.instance, 'start_date', None))
        end = data.get('end_date', getattr(self.instance, 'end_date', None))

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")

        # Add validation for value based on type if needed
        promo_type = data.get('type', getattr(self.instance, 'type', None))
        value = data.get('value', getattr(self.instance, 'value', None))
        # Example: Percentage promotions should be between 0 and 100
        # if promo_type == PromotionType.ORDER_PERCENTAGE and not (0 <= value <= 100):
        #      raise serializers.ValidationError("Percentage value must be between 0 and 100.")

        return data


# --- Coupon Serializer ---
class CouponSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=PromotionType.choices())  # Use PromotionType.choices()

    # value = serializers.DecimalField(...) # If using DecimalField
    # min_order_amount = serializers.DecimalField(...)
    # max_discount_amount = serializers.DecimalField(...)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'type', 'value',
            'min_order_amount', 'max_discount_amount', 'start_date', 'end_date',
            'usage_limit_per_user', 'usage_limit_per_coupon', 'current_usage',
            'is_active'
        ]
        read_only_fields = (
            'id', 'current_usage'
        )
        extra_kwargs = {
            # Code should be unique and likely case-insensitive on check
            'code': {'validators': []}, # Remove default unique validator if handling case-insensitivity in service
        }

    def validate_code(self, value):
        """Ensure code is uppercase and check uniqueness case-insensitively if needed."""
        code = value.strip().upper()
        # Check uniqueness case-insensitively during validation
        queryset = Coupon.objects.filter(code__iexact=code)
        if self.instance: # If updating, exclude self
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
             raise serializers.ValidationError(f"Coupon code '{code}' already exists.")
        return code

    def validate(self, data):
        """ Cross-field validation like PromotionSerializer. """
        start = data.get('start_date', getattr(self.instance, 'start_date', None))
        end = data.get('end_date', getattr(self.instance, 'end_date', None))

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")

        # Add validation for value based on type
        # ...

        return data


# --- Serializers for Association Management (Input) ---
class PromotionAssignmentSerializer(serializers.Serializer):
    """ Input for assigning promotions to products/categories. """
    promotion_id = serializers.IntegerField(required=True)
    # Use PrimaryKeyRelatedField for better validation if performance allows
    # product_ids = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), many=True, required=False)
    # category_ids = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True, required=False)
    product_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    category_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )

    def validate_promotion_id(self, value):
        if not Promotion.objects.filter(pk=value).exists():
            raise serializers.ValidationError(f"Promotion with ID {value} not found.")
        return value

    def validate_product_ids(self, value):
        if not value: return []
        count = Product.objects.filter(pk__in=value).count()
        if count != len(set(value)): # Check if all provided IDs exist
            raise serializers.ValidationError("One or more product IDs are invalid.")
        return list(set(value)) # Return unique IDs

    def validate_category_ids(self, value):
        if not value: return []
        count = Category.objects.filter(pk__in=value).count()
        if count != len(set(value)):
             raise serializers.ValidationError("One or more category IDs are invalid.")
        return list(set(value))


# --- Serializer for Coupon Validation (Input/Output) ---
class CouponValidationRequestSerializer(serializers.Serializer):
    code = serializers.CharField(required=True, max_length=255)
    # Optional: pass order amount to check min_order_amount condition
    # order_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

class CouponValidationResponseSerializer(serializers.Serializer):
    is_valid = serializers.BooleanField()
    message = serializers.CharField()
    discount_amount = serializers.IntegerField(required=False, allow_null=True) # Or DecimalField
    coupon_id = serializers.IntegerField(required=False, allow_null=True)
    final_amount = serializers.IntegerField(required=False, allow_null=True) # Optional: Amount after discount


# --- Coupon Usage Serializer (Read-Only) ---
class CouponUsageSerializer(serializers.ModelSerializer):
    # Show related object details if needed
    user_email = serializers.EmailField(source='user.email', read_only=True) # Example
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    order_code = serializers.CharField(source='order.order_code', read_only=True, allow_null=True)

    class Meta:
        model = CouponUsage
        fields = [
            'id', 'user', 'user_email', 'coupon', 'coupon_code', 'order',
            'order_code', 'used_at'
        ]
        read_only_fields = (
            'id', 'user', 'user_email', 'coupon', 'coupon_code', 'order',
            'order_code', 'used_at'
        ) # Typically all read-only