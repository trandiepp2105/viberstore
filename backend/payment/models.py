from django.db import models

class PaymentStatus(models.Model):
    """Model lưu các trạng thái thanh toán được dùng để theo dõi tiến trình giao dịch."""
    code = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        """Khai báo metadata cho `PaymentStatus`, gồm: db_table."""
        db_table = "payment_status"

class PaymentMethod(models.Model):
    """Model `PaymentMethod` của domain `payment`, biểu diễn phương thức thanh toán có mã, tên, mô tả và trạng thái hoạt động.. Thành phần chính: code, name, description, is_active, created_at, image_url."""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image_url = models.ImageField(upload_to='payment_methods/', null=True, blank=True)
    class Meta:
        """Khai báo metadata cho `PaymentMethod`, gồm: db_table."""
        db_table = "payment_method"
    
class Payment(models.Model):
    """Model `Payment` của domain `payment`, biểu diễn giao dịch thanh toán gắn với order, phương thức, trạng thái và mã giao dịch.. Thành phần chính: order, status, method, transaction_id, gateway_response, amount, paid_at, created_at, updated_at."""
    order = models.ForeignKey('order.Order', on_delete=models.CASCADE, related_name='payments')
    status = models.ForeignKey(PaymentStatus, null=True, on_delete=models.SET_NULL, related_name="payments")
    method = models.ForeignKey(PaymentMethod, null=True, on_delete=models.SET_NULL, related_name="payments")
    transaction_id = models.IntegerField(default=None, null=True, blank=True)
    gateway_response = models.JSONField(default=None, null=True, blank=True)
    amount = models.IntegerField()
    paid_at = models.DateTimeField(default=None, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `Payment`, gồm: db_table, ordering."""
        db_table = "payment"
        ordering = ['-created_at']
