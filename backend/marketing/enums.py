# create promotion type enum
from enum import Enum

class PromotionType(Enum):
    """Các loại promotion gồm giảm theo phần trăm, giảm cố định và miễn phí vận chuyển."""
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_SHIPPING = "free shipping"
    BUY_ONE_GET_ONE = "buy one get one"

    @classmethod
    def choices(cls):
        """Chuyển enum thành danh sách choices tương thích với field Django."""
        return [(tag.value, tag.value) for tag in cls]  # Ensure the value is used for both key and display
