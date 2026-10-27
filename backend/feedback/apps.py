from django.apps import AppConfig


class FeedbackConfig(AppConfig):
    """Đăng ký app `feedback`, nơi quản lý review và trạng thái kiểm duyệt."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'feedback'
