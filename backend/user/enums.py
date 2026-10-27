from enum import Enum

class RoleEnum(Enum):
    """Các role mặc định của hệ thống: admin, moderator và customer."""
    ADMIN = "Admin"
    MODERATOR = "Moderator"
    CUSTOMER = "Customer"
    EMPLOYEE = "Employee"

    @classmethod
    def choices(cls):
        """Chuyển enum thành danh sách choices tương thích với field Django."""
        return [(role.value, role.value) for role in cls]
