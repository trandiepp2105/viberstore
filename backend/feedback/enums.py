# create review status enum
from enum import Enum

class ReviewStatus(Enum):
    """Các trạng thái kiểm duyệt review: chờ duyệt, đã duyệt hoặc bị từ chối."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELED = "canceled"

    @classmethod
    def choices(cls):
        """Chuyển enum thành danh sách choices tương thích với field Django."""
        return [(status.name, status.value) for status in cls]
