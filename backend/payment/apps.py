from django.apps import AppConfig


class PaymentConfig(AppConfig):
    """Đăng ký app `payment`, nơi quản lý payment method, trạng thái và giao dịch."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payment'
