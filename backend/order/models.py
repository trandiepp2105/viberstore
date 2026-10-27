from django.db import models

from order.enums import OrderStatus
from address.models import DeliveryAddress
class OrderStatus(models.Model):
    """Model lưu danh mục trạng thái order với mã, tên hiển thị và mô tả."""
    status_code = models.CharField(max_length=50, unique=True)
    status_name = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Khai báo metadata cho `OrderStatus`, gồm: db_table."""
        db_table = "order_status"

class ShippingMethod(models.Model):
    """Model `ShippingMethod` của domain `order`, biểu diễn phương thức vận chuyển và phí cơ bản.. Thành phần chính: method_code, method_name, base_cost, description, is_active, created_at."""
    method_code = models.CharField(max_length=50, unique=True)
    method_name = models.CharField(max_length=50)
    base_cost = models.IntegerField(null=True, blank=True)  # Chi phí cơ bản cho phương thức vận chuyển
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Khai báo metadata cho `ShippingMethod`, gồm: db_table."""
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


class Order(models.Model):
    """Model `Order` của domain `order`, biểu diễn đơn hàng gồm user, địa chỉ, trạng thái, vận chuyển, thanh toán và các khoản tiền.. Thành phần chính: user, delivery_address, shipping_method, current_status, payment_method, order_code, total_amount, discount_amount, final_amount, order_date, shipping_fee, customer_note, admin_note, tax_amount, created_at, updated_at."""
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
        """Khai báo metadata cho `Order`, gồm: db_table."""
        db_table = "order"

class OrderItem(models.Model):
    """Model `OrderItem` của domain `order`, biểu diễn dòng sản phẩm trong order, lưu số lượng và giá tại thời điểm mua.. Thành phần chính: order, variant, quantity, price_at_purchase, variant_details, product_name, variant_image, size, color, sale_price_at_purchase, sku, created_at, updated_at."""
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
        """Khai báo metadata cho `OrderItem`, gồm: db_table."""
        db_table = "order_item"


class CancelledOrder(models.Model):
    """Model `CancelledOrder` của domain `order`, biểu diễn thông tin hủy order và lý do hủy.. Thành phần chính: order, cancelled_at, reason, created_at, updated_at."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="cancelled_order")
    cancelled_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(null=True, blank=True)  # Lý do hủy đơn hàng
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `CancelledOrder`, gồm: db_table."""
        db_table = "cancelled_order"

class OrderReutrnStatus(models.Model):
    """Model lưu các trạng thái xử lý yêu cầu trả hàng của order."""
    status_code = models.CharField(max_length=50, unique=True)
    status_name = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Khai báo metadata cho `OrderReutrnStatus`, gồm: db_table."""
        db_table = "order_return_status"

class ReturnedOrder(models.Model):
    """Model `ReturnedOrder` của domain `order`, biểu diễn yêu cầu trả hàng của order cùng trạng thái và số tiền hoàn.. Thành phần chính: order, status, returned_at, general_reason, total_refund, total_items, created_at, processed_at."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="returned_order")
    status = models.ForeignKey(OrderReutrnStatus, on_delete=models.SET_NULL, null=True, blank=True)
    returned_at = models.DateTimeField(auto_now_add=True)
    general_reason = models.TextField(null=True, blank=True)  # Lý do trả hàng
    total_refund = models.IntegerField()  # Tổng số tiền hoàn lại
    total_items = models.IntegerField()  # Tổng số lượng sản phẩm trả lại
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)  # Thời gian xử lý hoàn tiền

    class Meta:
        """Khai báo metadata cho `ReturnedOrder`, gồm: db_table."""
        db_table = "returned_order"

class OrderReturnedItem(models.Model):
    """Model `OrderReturnedItem` của domain `order`, biểu diễn item thuộc yêu cầu trả hàng và số tiền hoàn.. Thành phần chính: returned_order, order_item, quantity, refund_amount, reason, created_at, updated_at."""
    returned_order = models.ForeignKey(ReturnedOrder, on_delete=models.CASCADE, related_name="returned_items")
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name="returned_items")
    quantity = models.PositiveIntegerField()  # Số lượng sản phẩm trả lại
    refund_amount = models.IntegerField()  # Số tiền hoàn lại cho sản phẩm
    reason = models.TextField(null=True, blank=True)  # Lý do trả hàng cho từng sản phẩm
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `OrderReturnedItem`, gồm: db_table."""
        db_table = "order_returned_item"

class OrderHistory(models.Model):
    """Model `OrderHistory` của domain `order`, biểu diễn lịch sử chuyển trạng thái order.. Thành phần chính: order, staff_in_charge, status, changed_at, note, created_at, updated_at."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="history")
    staff_in_charge = models.ForeignKey("user.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="order_history")
    status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(null=True, blank=True)  # Ghi chú về trạng thái
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `OrderHistory`, gồm: db_table."""
        db_table = "order_history"


class DeliveryMethod(models.Model):
    """Model `DeliveryMethod` của domain `order`, biểu diễn dữ liệu persistent của domain này. Thành phần chính: name, description, code."""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        """Khai báo metadata cho `DeliveryMethod`, gồm: db_table."""
        db_table = "delivery_method"

    def __str__(self):
        """Trả về biểu diễn chuỗi dễ đọc của đối tượng."""
        return self.name
