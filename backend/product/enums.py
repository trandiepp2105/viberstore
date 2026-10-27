from enum import Enum

class SupplierStatus(Enum):
    """Các trạng thái hoạt động cho phép hoặc ngừng sử dụng supplier trong catalog."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

    @classmethod
    def choices(cls):
        """Chuyển enum thành danh sách choices tương thích với field Django."""
        return [(status.value, status.name) for status in cls]
