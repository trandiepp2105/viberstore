from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from .enums import RoleEnum
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    first_name = None  
    last_name = None  
    username = None   
    name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Full Name")
    email = models.EmailField(max_length=255, unique=True, verbose_name="Email Address")
    password = models.CharField(max_length=128, verbose_name="Password")
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name="Phone Number")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    is_verify = models.BooleanField(default=False, verbose_name="Email Verified")
    last_login = models.DateTimeField(default=timezone.now, verbose_name="Last Login")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    roles = models.ManyToManyField(
        'Role',
        through='UserRole',
        related_name='users',
        verbose_name="Roles"
    )
    def __str__(self):
        return self.email

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = 'user'

    def add_role(self, role_name):
        """Thêm một role cho user"""
        role, created = Role.objects.get_or_create(name=role_name)
        UserRole.objects.get_or_create(user=self, role=role)

    def remove_role(self, role_name):
        """Xóa một role khỏi user"""
        role = Role.objects.filter(name=role_name).first()
        if role:
            UserRole.objects.filter(user=self, role=role).delete()

    def has_role(self, role_name):
        """Kiểm tra user có role nào đó"""
        return self.roles.filter(role__name=role_name).exists()

    def get_roles(self):
        """Lấy danh sách role của user"""
        return self.roles.values_list('role__name', flat=True)

# Role model
class Role(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
        choices=RoleEnum.choices(),
        verbose_name="Role Name"
    )
    description = models.TextField(blank=True, null=True, verbose_name="Role Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        db_table = 'role'


# Many-to-Many Relationship between User and Role
class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_roles", verbose_name="User")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="user_roles", verbose_name="Role")
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name="Assigned At")

    class Meta:
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"
        unique_together = ('user', 'role')
        db_table = 'user_role'

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"

