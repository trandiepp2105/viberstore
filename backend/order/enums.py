# create order status enum

from enum import Enum

class OrderStatus(Enum):
    """Các trạng thái nghiệp vụ dùng để biểu diễn tiến trình xử lý order."""
    PENDING = "pending"
    PACKED = "packed"
    DELIVERING = "delivering"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    REFUNDED = "refunded"

    @classmethod
    def choices(cls):
        """Chuyển enum thành danh sách choices tương thích với field Django."""
        return [(status.value, status.name) for status in cls]
