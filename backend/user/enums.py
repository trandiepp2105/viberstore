from enum import Enum

class RoleEnum(Enum):
    ADMIN = "Admin"
    MODERATOR = "Moderator"
    CUSTOMER = "Customer"
    EMPLOYEE = "Employee"

    @classmethod
    def choices(cls):
        return [(role.value, role.value) for role in cls]