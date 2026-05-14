from django.db import models
from marketing.enums import PromotionType
# Create your models here.
class Promotion(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=50, choices=PromotionType.choices())
    value = models.IntegerField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_discount_amount = models.IntegerField(null=True, blank=True, default=None)
    min_order_amount = models.IntegerField(null=True, blank=True, default=None)
    usage_limit = models.IntegerField(null=True, blank=True, default=None)
    current_usage = models.IntegerField(default=0)
    priority = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'promotion'

class ProductPromotion(models.Model):
    product = models.ForeignKey('product.Product', on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_promotion'

class CategoryPromotion(models.Model):
    category = models.ForeignKey('product.Category', on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'category_promotion'

class Coupon(models.Model):
    code = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    type = models.CharField(max_length=50, choices=PromotionType.choices())
    value = models.IntegerField(null=True, blank=True, default=None)
    min_order_amount = models.IntegerField(null=True, blank=True, default=None)
    max_discount_amount = models.IntegerField(null=True, blank=True, default=None)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    usage_limit_per_user = models.IntegerField(null=True, blank=True, default=None)
    usage_limit_per_coupon = models.IntegerField(null=True, blank=True, default=None)
    current_usage = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coupon'

class CouponUsage(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    order = models.ForeignKey('order.Order', on_delete=models.CASCADE, null=True, blank=True)
    used_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coupon_usage'