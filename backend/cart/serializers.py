# cart_app/serializers.py
from rest_framework import serializers
from cart.models import CartItem
from typing import Optional
# Import ProductVariantSerializer from your product app
# Adjust the import path as needed
from product.serializers import ProductVariantSerializer # Keep this for variant_details
from product.models import ProductVariant # Keep this for queryset/validation

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for CartItem. Shows nested variant details on read,
    accepts variant ID on write. Calculates item total based on Product price.
    """
    # Read-only nested serializer for variant details
    variant_details = ProductVariantSerializer(source='variant', read_only=True)

    # Write-only field to accept variant ID during creation/update
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True, product__is_published=True), # Only allow active/published variants
        write_only=True,
        required=True, # Must provide a variant
        help_text="ID of the Product Variant to add to the cart."
    )

    # Calculated field for item total price (read-only)
    item_total_price = serializers.SerializerMethodField()

    # Field to return all available variants of the product
    available_variants = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'variant',          # Write-only ID
            'variant_details',  # Read-only nested object
            'quantity',
            'item_total_price', # Calculated field
            'available_variants',  # New field
            'created_at',
            'updated_at',
        ]
        read_only_fields = (
            'id',
            'variant_details',
            'item_total_price',
            'created_at',
            'updated_at',
        )
        extra_kwargs = {
            'quantity': {'required': True, 'min_value': 0, 'help_text': "Desired quantity. Set to 0 to remove item."},
        }

    def get_item_total_price(self, obj: CartItem) -> Optional[int]:
        """
        Calculates the total price for this cart item based on the
        effective price (sale or regular) of the associated Product.
        """
        if obj.variant and obj.variant.product:
            product = obj.variant.product
            try:
                # Determine the effective price from the Product model
                # Convert IntegerFields to Decimal for calculation
                effective_price = 0
                if product.sale_price > 0:
                    effective_price = product.sale_price
                else:
                    effective_price = product.price

                return obj.quantity * effective_price
            except (TypeError, ValueError) as e:
                # Handle cases where price fields might not be valid numbers (unlikely with IntegerField, but good practice)
                raise serializers.ValidationError(f"Error calculating total price: {str(e)}")
        return None # Return None if variant or product is missing

    def get_available_variants(self, obj: CartItem):
        """
        Returns all variants of the product related to this cart item.
        """
        if obj.variant and obj.variant.product:
            variants = obj.variant.product.variants.select_related('size', 'color')
            # Pass context to ensure absolute URLs for image_url
            return ProductVariantSerializer(variants, many=True, context=self.context).data
        return []

    def validate_variant(self, value: ProductVariant):
        """
        Additional validation for the variant.
        """
        if not value.is_active or not value.product.is_published:
             raise serializers.ValidationError("Selected product variant is not available for purchase.")
        return value

    # Stock validation is still best handled in the service layer.