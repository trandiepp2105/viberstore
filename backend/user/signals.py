# user/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Role, UserRole
from .enums import RoleEnum

@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    if created:
        # Tạo hoặc lấy role Customer từ Enum
        customer_role, _ = Role.objects.get_or_create(name=RoleEnum.CUSTOMER.value)
        # Gán role Customer cho user vừa được tạo
        UserRole.objects.get_or_create(user=instance, role=customer_role)
