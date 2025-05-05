# create promotion type enum
from enum import Enum

class PromotionType(Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_SHIPPING = "free shipping"
    BUY_ONE_GET_ONE = "buy one get one"

    @classmethod
    def choices(cls):
        return [(tag.value, tag.value) for tag in cls]  # Ensure the value is used for both key and display