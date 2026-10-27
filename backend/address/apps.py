from django.apps import AppConfig


class AddressConfig(AppConfig):
    """Đăng ký app `address`, nơi quản lý địa giới hành chính và địa chỉ giao hàng."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'address'
