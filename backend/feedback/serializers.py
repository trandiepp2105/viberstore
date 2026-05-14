# feedback_app/serializers.py
import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Review
from .enums import ReviewStatus
# Import related models and serializers
from product.models import Product
from order.models import Order, OrderItem
from user.models import User
# Assuming simple serializers exist for User and Product display
# Adjust imports as needed
from user.serializers import UserSimpleSerializer
# from product_app.serializers import ProductSimpleSerializer

logger = logging.getLogger(__name__)

# --- Simple Serializers for nested display (if not already defined elsewhere) ---

class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug']

# --- Review Serializer ---
class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reading and creating/updating reviews."""
    # Read-only fields for displaying related object details
    user_details = UserSimpleSerializer(source='user', read_only=True)
    product_details = ProductSimpleSerializer(source='product', read_only=True)
    order_code = serializers.CharField(source='order.order_code', read_only=True)

    # Fields for writing (IDs are expected)
    # User is automatically set based on the request
    user = serializers.PrimaryKeyRelatedField(read_only=True) # Set automatically
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_published=True), # Only review published products
        write_only=True,
        required=True
    )
    order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), # Service layer will validate ownership/product link
        write_only=True,
        required=True
    )

    # Status is read-only for users creating/updating their review content
    status = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Rating is optional, but must be within range if provided
    rating = serializers.ChoiceField(choices=[(i, str(i)) for i in range(1, 6)], allow_null=True, required=False)
    # Comment is optional
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True, style={'base_template': 'textarea.html'})

    class Meta:
        model = Review
        fields = [
            'id',
            'user', 'user_details',
            'product', 'product_details',
            'order', 'order_code', # Write 'order', Read 'order_code'
            'rating', 'comment',
            'status', 'status_display',
            'created_at', 'updated_at',
        ]
        read_only_fields = (
            'id', 'user', 'user_details', 'product_details', 'order_code',
            'status', 'status_display', 'created_at', 'updated_at'
        )

    def validate(self, data):
        """
        Ensure either rating or comment is present.
        Service layer handles more complex validation (ownership, product in order etc).
        """
        rating = data.get('rating', getattr(self.instance, 'rating', None))
        comment = data.get('comment', getattr(self.instance, 'comment', None))

        if rating is None and not comment:
            raise serializers.ValidationError("A review must have at least a rating or a comment.")

        # Basic duplicate check (UniqueConstraint is better, but this adds API level check)
        # This requires the context to have the user
        # request = self.context.get('request')
        # user = request.user if request else None
        # product = data.get('product')
        # order = data.get('order')
        # if user and product and order:
        #    queryset = Review.objects.filter(user=user, product=product, order=order)
        #    if self.instance: # Exclude self if updating
        #        queryset = queryset.exclude(pk=self.instance.pk)
        #    if queryset.exists():
        #         raise serializers.ValidationError("You have already reviewed this product for this order.")

        return data

# --- Serializer for Admin updating status ---
class ReviewStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(    choices=[status.value for status in ReviewStatus], required=True)
    # Optional note from admin?
    # admin_note = serializers.CharField(required=False, allow_blank=True)