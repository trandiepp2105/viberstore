from django.db import models

from order.enums import OrderStatus
from address.models import DeliveryAddress
class OrderStatus(models.Model):
    status_code = models.CharField(max_length=50, unique=True)
    status_name = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_status"

class ShippingMethod(models.Model):
    method_code = models.CharField(max_length=50, unique=True)
    method_name = models.CharField(max_length=50)
    base_cost = models.IntegerField(null=True, blank=True)  # Chi phí cơ bản cho phương thức vận chuyển
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "shipping_method"

# class DeliveryInfo(models.Model):
#     user = models.ForeignKey("user.User", on_delete=models.CASCADE, related_name="delivery_infos")
#     is_default = models.BooleanField(default=False)
#     recipient_name = models.CharField(max_length=255)
#     province_city = models.CharField(max_length=255)
#     district = models.CharField(max_length=255)
#     ward_commune = models.CharField(max_length=255)
#     specific_address = models.CharField(max_length=255)
#     phone_number = models.CharField(max_length=20)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = "delivery_info"


# Create your models here.
class Order(models.Model):
    user = models.ForeignKey("user.User", on_delete=models.CASCADE, related_name="orders")
    delivery_address = models.ForeignKey(DeliveryAddress, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    shipping_method = models.ForeignKey(ShippingMethod, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    current_status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    
    payment_method = models.ForeignKey('payment.PaymentMethod', null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    order_code = models.CharField(max_length=50, unique=True)
    total_amount = models.IntegerField()
    discount_amount = models.IntegerField(default=0, null=True, blank=True)  # Số tiền giảm giá
    final_amount = models.IntegerField()
    order_date = models.DateTimeField(auto_now_add=True)
    shipping_fee = models.IntegerField(default=0)
    customer_note = models.TextField(null=True, blank=True)
    admin_note = models.TextField(null=True, blank=True)
    tax_amount = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey('product.ProductVariant', on_delete=models.CASCADE, related_name="order_items")
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.IntegerField()
    variant_details = models.CharField(max_length=255, null=True, blank=True)  # Thông tin chi tiết về biến thể sản phẩm (size, color, etc.)
    product_name = models.CharField(max_length=255)  # Tên sản phẩm
    variant_image = models.URLField(null=True, blank=True)  # URL hình ảnh sản phẩm
    size = models.CharField(max_length=50, null=True, blank=True)  # Kích thước của sản phẩm
    color = models.CharField(max_length=50, null=True, blank=True)  # Màu sắc của sản phẩm
    sale_price_at_purchase = models.IntegerField(null=True, blank=True)  # Giá bán tại thời điểm mua hàng
    sku = models.CharField(max_length=255, null=True, blank=True)  # SKU của sản phẩm
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_item"


class CancelledOrder(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="cancelled_order")
    cancelled_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(null=True, blank=True)  # Lý do hủy đơn hàng
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cancelled_order"

class OrderReutrnStatus(models.Model):
    status_code = models.CharField(max_length=50, unique=True)
    status_name = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_return_status"

class ReturnedOrder(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="returned_order")
    status = models.ForeignKey(OrderReutrnStatus, on_delete=models.SET_NULL, null=True, blank=True)
    returned_at = models.DateTimeField(auto_now_add=True)
    general_reason = models.TextField(null=True, blank=True)  # Lý do trả hàng
    total_refund = models.IntegerField()  # Tổng số tiền hoàn lại
    total_items = models.IntegerField()  # Tổng số lượng sản phẩm trả lại
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)  # Thời gian xử lý hoàn tiền

    class Meta:
        db_table = "returned_order"

class OrderReturnedItem(models.Model):
    returned_order = models.ForeignKey(ReturnedOrder, on_delete=models.CASCADE, related_name="returned_items")
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name="returned_items")
    quantity = models.PositiveIntegerField()  # Số lượng sản phẩm trả lại
    refund_amount = models.IntegerField()  # Số tiền hoàn lại cho sản phẩm
    reason = models.TextField(null=True, blank=True)  # Lý do trả hàng cho từng sản phẩm
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_returned_item"

class OrderHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="history")
    staff_in_charge = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="order_history")
    status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(null=True, blank=True)  # Ghi chú về trạng thái
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_history"


class DeliveryMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "delivery_method"

    def __str__(self):
        return self.name