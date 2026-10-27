from django.apps import AppConfig


class CartConfig(AppConfig):
    """Đăng ký app `cart`, nơi quản lý các item trong giỏ hàng của user."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cart'
