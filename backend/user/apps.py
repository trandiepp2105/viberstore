from django.apps import AppConfig


class UserConfig(AppConfig):
    """Đăng ký app `user`, nơi quản lý tài khoản, role, JWT và xác thực OTP."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'
