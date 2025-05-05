# product_app/permissions.py (Tạo file mới nếu chưa có)
from rest_framework import permissions

class ReadOnly(permissions.BasePermission):
    """
    Allows access only for safe HTTP methods (GET, HEAD, OPTIONS).
    """
    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS') # Định nghĩa lại nếu không muốn import từ permissions

    def has_permission(self, request, view):
        return request.method in self.SAFE_METHODS
    

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users with is_staff=True.
    (Thực ra giống hệt permissions.IsAdminUser của DRF)
    """

    def has_permission(self, request, view):
        # User phải đăng nhập và là staff
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

# class IsSuperAdminUser(permissions.BasePermission):
#     """ Ví dụ: Chỉ cho phép superuser """
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

# class IsContentManagerUser(permissions.BasePermission):
#     """ Ví dụ: Kiểm tra role hoặc group """
#     def has_permission(self, request, view):
#         if not (request.user and request.user.is_authenticated):
#             return False
#         # Giả sử bạn có profile liên kết với user hoặc dùng group
#         # return request.user.profile.role == 'content_manager'
#         # hoặc
#         # return request.user.groups.filter(name='Content Managers').exists()
#         return False # Logic kiểm tra cụ thể của bạn ở đây