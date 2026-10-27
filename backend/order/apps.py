from django.apps import AppConfig


class OrderConfig(AppConfig):
    """Đăng ký app `order`, nơi quản lý order, trạng thái, vận chuyển và trả hàng."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'order'
