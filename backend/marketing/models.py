from django.db import models
from marketing.enums import PromotionType
class Promotion(models.Model):
    """Model `Promotion` của domain `marketing`, biểu diễn chương trình khuyến mãi gồm loại, giá trị, thời gian hiệu lực và trạng thái.. Thành phần chính: name, description, type, value, start_date, end_date, max_discount_amount, min_order_amount, usage_limit, current_usage, priority, is_active, created_at, updated_at."""
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
        """Khai báo metadata cho `Promotion`, gồm: db_table."""
        db_table = 'promotion'

class ProductPromotion(models.Model):
    """Model `ProductPromotion` của domain `marketing`, biểu diễn dữ liệu persistent của domain này. Thành phần chính: product, promotion, created_at, updated_at."""
    product = models.ForeignKey('product.Product', on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `ProductPromotion`, gồm: db_table."""
        db_table = 'product_promotion'

class CategoryPromotion(models.Model):
    """Model `CategoryPromotion` của domain `marketing`, biểu diễn dữ liệu persistent của domain này. Thành phần chính: category, promotion, created_at, updated_at."""
    category = models.ForeignKey('product.Category', on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `CategoryPromotion`, gồm: db_table."""
        db_table = 'category_promotion'

class Coupon(models.Model):
    """Model `Coupon` của domain `marketing`, biểu diễn mã giảm giá cùng điều kiện, thời hạn và giới hạn sử dụng.. Thành phần chính: code, description, type, value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit_per_user, usage_limit_per_coupon, current_usage, is_active, created_at, updated_at."""
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
        """Khai báo metadata cho `Coupon`, gồm: db_table."""
        db_table = 'coupon'

class CouponUsage(models.Model):
    """Model `CouponUsage` của domain `marketing`, biểu diễn lịch sử user sử dụng coupon cho order.. Thành phần chính: user, coupon, order, used_at, created_at, updated_at."""
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    order = models.ForeignKey('order.Order', on_delete=models.CASCADE, null=True, blank=True)
    used_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Khai báo metadata cho `CouponUsage`, gồm: db_table."""
        db_table = 'coupon_usage'
