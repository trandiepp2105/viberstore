# order_app/serializers.py
from rest_framework import serializers

# Import models from this app
from order.models import (
    OrderStatus, ShippingMethod,Order, OrderItem, CancelledOrder, OrderReutrnStatus, ReturnedOrder,
    OrderReturnedItem, OrderHistory
)
from address.models import DeliveryAddress # Assuming a DeliveryAddress model exists in address_app
from address.serializers import DeliveryAddressSerializer  # Assuming a simple DeliveryAddress serializer exists
# Import related serializers/models from other apps
from product.serializers import ProductVariantSerializer
from product.models import ProductVariant
from user.models import User  # Assuming a User model exists in user_app
from user.serializers import UserSerializer  # Assuming a simple User serializer exists
# Assuming a simple User serializer exists
# from user_app.serializers import UserSerializer
from marketing.models import Coupon
from marketing.serializers import CouponSerializer
from cart.models import CartItem
from cart.serializers import CartItemSerializer
from payment.serializers import PaymentMethodSerializer

class OrderStatusSerializer(serializers.ModelSerializer):
    """Serializer `OrderStatusSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `OrderStatusSerializer`, gồm: model, fields, read_only_fields."""
        model = OrderStatus
        fields = ['id', 'status_code', 'status_name', 'description', 'created_at']
        read_only_fields = ('id', 'created_at')

class ShippingMethodSerializer(serializers.ModelSerializer):
    """Serializer `ShippingMethodSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `ShippingMethodSerializer`, gồm: model, fields, read_only_fields."""
        model = ShippingMethod
        fields = ['id', 'method_code', 'method_name', 'base_cost', 'description', 'is_active', 'created_at']
        read_only_fields = ('id', 'created_at')

class OrderReturnStatusSerializer(serializers.ModelSerializer):
    """Serializer `OrderReturnStatusSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `OrderReturnStatusSerializer`, gồm: model, fields, read_only_fields."""
        model = OrderReutrnStatus
        fields = ['id', 'status_code', 'status_name', 'description', 'created_at']
        read_only_fields = ('id', 'created_at')


# --- Order Item Serializer (Primarily Read-Only in Order Context) ---

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer `OrderItemSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: variant_details, variant, item_subtotal, variant_image, size, color, sale_price_at_purchase, get_item_subtotal(), get_variant_image()."""
    # Show variant details on read
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    # Accept variant ID on write (although OrderItems are usually created by the Order service)
    variant = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all(), write_only=True, allow_null=True)
    item_subtotal = serializers.SerializerMethodField()
    variant_image = serializers.SerializerMethodField()  # Change to a method field
    size = serializers.CharField(read_only=True)  # Ensure size is read-only
    color = serializers.CharField(read_only=True)  # Ensure color is read-only
    sale_price_at_purchase = serializers.IntegerField(read_only=True)  # Ensure sale price is read-only

    class Meta:
        """Khai báo metadata cho `OrderItemSerializer`, gồm: model, fields, read_only_fields."""
        model = OrderItem
        fields = [
            'id', 'order', 'variant', 'variant_details', 'quantity',
            'price_at_purchase', 'item_subtotal', 'variant_details',
            'product_name', 'variant_image', 'sku',
            'created_at', 'updated_at', 'size', 'color', 'sale_price_at_purchase'  # Include new fields
        ]
        read_only_fields = (
            'id', 'order', 'variant_details', 'item_subtotal',
            'price_at_purchase', 'variant_details', 'product_name',
            'variant_image', 'sku', 'created_at', 'updated_at', 'size', 'color', 'sale_price_at_purchase'  # Mark new fields as read-only
        ) # Most fields are read-only after order creation

    def get_item_subtotal(self, obj: OrderItem) -> int: # Or Decimal
        """Xử lý `get_item_subtotal` của serializer `OrderItemSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
        # Ensure calculation uses the price *at the time of purchase*
        try:
            # Assumes IntegerField, use Decimal() if model uses DecimalField
            return obj.quantity * obj.price_at_purchase
        except TypeError:
            return 0 # Or handle error appropriately

    def get_variant_image(self, obj):
        """Prepend the host to the variant_image URL."""
        request = self.context.get('request')
        if obj.variant_image and request:
            return request.build_absolute_uri(obj.variant_image)
        return obj.variant_image

# --- Cancellation Serializer ---

class CancelledOrderSerializer(serializers.ModelSerializer):
    """Serializer `CancelledOrderSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: order."""
    order = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        """Khai báo metadata cho `CancelledOrderSerializer`, gồm: model, fields, read_only_fields."""
        model = CancelledOrder
        fields = ['id', 'order', 'cancelled_at', 'reason', 'created_at', 'updated_at']
        read_only_fields = ('id', 'order', 'cancelled_at', 'created_at', 'updated_at')

# --- Return Serializers ---

class OrderReturnedItemSerializer(serializers.ModelSerializer):
    """Serializer `OrderReturnedItemSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: order_item_details, order_item."""
    # Read-only details of the original order item
    order_item_details = OrderItemSerializer(source='order_item', read_only=True)
    # Accept order_item ID on write (likely done via Return service)
    order_item = serializers.PrimaryKeyRelatedField(queryset=OrderItem.objects.all(), write_only=True)

    class Meta:
        """Khai báo metadata cho `OrderReturnedItemSerializer`, gồm: model, fields, read_only_fields."""
        model = OrderReturnedItem
        fields = [
            'id', 'returned_order', 'order_item', 'order_item_details',
            'quantity', 'refund_amount', 'reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'returned_order', 'order_item_details', 'created_at', 'updated_at')

class ReturnedOrderSerializer(serializers.ModelSerializer):
    """Serializer `ReturnedOrderSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: order, status_details, status, returned_items."""
    order = serializers.PrimaryKeyRelatedField(read_only=True)
    status_details = OrderReturnStatusSerializer(source='status', read_only=True)
    status = serializers.PrimaryKeyRelatedField(queryset=OrderReutrnStatus.objects.all(), write_only=True, allow_null=True, required=False)
    returned_items = OrderReturnedItemSerializer(many=True, read_only=True) # Show nested returned items

    class Meta:
        """Khai báo metadata cho `ReturnedOrderSerializer`, gồm: model, fields, read_only_fields."""
        model = ReturnedOrder
        fields = [
            'id', 'order', 'status', 'status_details', 'returned_at',
            'general_reason', 'total_refund', 'total_items',
            'processed_at', 'created_at', 'returned_items'
        ]
        read_only_fields = ('id', 'order', 'status_details', 'returned_at', 'created_at', 'returned_items')


# --- Order History Serializer ---

class OrderHistorySerializer(serializers.ModelSerializer):
    """Serializer `OrderHistorySerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: status_details, staff_in_charge_details."""
    status_details = OrderStatusSerializer(source='status', read_only=True)
    staff_in_charge_details = UserSerializer(source='staff_in_charge', read_only=True)
    # order = serializers.PrimaryKeyRelatedField(read_only=True) # Probably not needed here

    class Meta:
        """Khai báo metadata cho `OrderHistorySerializer`, gồm: model, fields, read_only_fields."""
        model = OrderHistory
        fields = [
            'id', 'status', 'status_details', 'staff_in_charge', 'staff_in_charge_details',
            'changed_at', 'note'
        ]
        read_only_fields = ('id', 'status_details', 'staff_in_charge_details', 'changed_at')


# --- Main Order Serializer (Primarily for Reading/Limited Updates) ---
class OrderSerializer(serializers.ModelSerializer):
    """Serializer `OrderSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: delivery_address_details, shipping_method_details, current_status_details, user_details, payment_method_details, user, delivery_address, shipping_method, current_status, vnpay_payment_url, selected_coupons, promotion, discount, order_items, get_promotion()."""
    # Nested details for related objects on read
    delivery_address_details = DeliveryAddressSerializer(source='delivery_address', read_only=True)
    shipping_method_details = ShippingMethodSerializer(source='shipping_method', read_only=True)
    current_status_details = OrderStatusSerializer(source='current_status', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)  # User details for the order
    payment_method_details = PaymentMethodSerializer(source='payment_method', read_only=True)
    # Fields for writing (usually limited for updates, creation is handled by service)
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Set automatically
    delivery_address = serializers.PrimaryKeyRelatedField(queryset=DeliveryAddress.objects.all(), required=False, allow_null=True)
    shipping_method = serializers.PrimaryKeyRelatedField(queryset=ShippingMethod.objects.filter(is_active=True), write_only=True, required=False, allow_null=True)
    current_status = serializers.PrimaryKeyRelatedField(queryset=OrderStatus.objects.all(), write_only=True, required=False, allow_null=True)

    # Additional fields
    vnpay_payment_url = serializers.CharField(required=False, read_only=True)
    selected_coupons = CouponSerializer(many=True, required=False, allow_null=True)
    promotion = serializers.IntegerField(required=False, allow_null=True)
    discount = serializers.IntegerField(required=False, allow_null=True)
    order_items = OrderItemSerializer(source='items', many=True, read_only=True)  # Add this field

    class Meta:
        """Khai báo metadata cho `OrderSerializer`, gồm: model, fields, read_only_fields."""
        model = Order
        fields = [
            'id', 'order_code', 'user',
            'delivery_address', 'delivery_address_details',
            'shipping_method', 'shipping_method_details',
            'payment_method', 'payment_method_details','current_status', 'current_status_details',
            'order_date', 'total_amount', 'shipping_fee', 'tax_amount',
            'final_amount', 'customer_note', 'admin_note',
             'created_at', 'updated_at', 'promotion', 'discount',
            'selected_coupons', 'vnpay_payment_url', 'order_items', 'user_details' # Include the new field here
        ]
        read_only_fields = (
            'id', 'order_code', 'user', 'delivery_address_details',
            'shipping_method_details', 'current_status_details', 'payment_method_details','order_date',
            'total_amount', 'shipping_fee', 'tax_amount', 'final_amount',
            'created_at', 'updated_at', 'promotion',
            'discount', 'selected_coupons',
            'vnpay_payment_url', 'order_items',  'user_details'# Mark the new field as read-only
        )

    def get_promotion(self, obj):
        """
        Calculate the total promotion for the order.
        """
        total_promotion = 0
        for item in obj.order_items.all():
            price_at_purchase = item.price_at_purchase
            sale_price_at_purchase = item.sale_price_at_purchase

            if sale_price_at_purchase and sale_price_at_purchase > 0:
                total_promotion += price_at_purchase - sale_price_at_purchase
            else:
                total_promotion += 0  # No promotion applied

        return total_promotion

class TemporaryOrderCartItemSerializer(serializers.Serializer):
    """Serializer `TemporaryOrderCartItemSerializer` của domain `order`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: id, quantity, price."""
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    price = serializers.IntegerField()
