from rest_framework import permissions

class ReadOnly(permissions.BasePermission):
    """
    Allows access only for safe HTTP methods (GET, HEAD, OPTIONS).
    """
    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')

    def has_permission(self, request, view):
        return request.method in self.SAFE_METHODS
    

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users with is_staff=True.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
