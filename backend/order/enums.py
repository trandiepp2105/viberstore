# create order status enum

from enum import Enum

class OrderStatus(Enum):
    PENDING = "pending"
    PACKED = "packed"
    DELIVERING = "delivering"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    REFUNDED = "refunded"

    @classmethod
    def choices(cls):
        return [(status.value, status.name) for status in cls]