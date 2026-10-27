from django.apps import AppConfig


class MarketingConfig(AppConfig):
    """Đăng ký app `marketing`, nơi quản lý promotion, coupon và lịch sử sử dụng coupon."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'marketing'
