from enum import Enum

class SupplierStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

    @classmethod
    def choices(cls):
        return [(status.value, status.name) for status in cls]