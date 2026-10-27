from django.apps import AppConfig


class ProductConfig(AppConfig):
    """Đăng ký app `product`, nơi quản lý catalog, supplier, category và product variant."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'product'
