from django.conf import settings
from user.models import User

from django.core.management.base import BaseCommand

class Command(BaseCommand):
    """Tạo tài khoản admin từ thông tin cấu hình môi trường nếu tài khoản chưa tồn tại."""
    help = 'Create admin user'

    def handle(self, *args, **kwargs):
        """Thực thi lệnh quản trị với các tham số đầu vào được cung cấp."""
        if User.objects.filter(email=settings.ADMIN_EMAIL).exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        User.objects.create_superuser(
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD
        )
        self.stdout.write(self.style.SUCCESS('Admin user created successfully'))
