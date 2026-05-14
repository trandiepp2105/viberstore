from django.db import models

class PaymentStatus(models.Model):
    code = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "payment_status"

class PaymentMethod(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image_url = models.ImageField(upload_to='payment_methods/', null=True, blank=True)
    class Meta:
        db_table = "payment_method"
    
# Create your models here.
class Payment(models.Model):
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
        db_table = "payment"
        ordering = ['-created_at']
