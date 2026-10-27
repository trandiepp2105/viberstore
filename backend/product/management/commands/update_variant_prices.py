from django.core.management.base import BaseCommand
from product.models import ProductVariant

class Command(BaseCommand):
    """Cập nhật giá của các product variant theo dữ liệu sản phẩm trong database."""
    help = "Kiểm tra và cập nhật giá của tất cả các ProductVariant."

    def handle(self, *args, **kwargs):
        """Thực thi lệnh quản trị với các tham số đầu vào được cung cấp."""
        updated_count = 0

        # Lấy tất cả các ProductVariant
        variants = ProductVariant.objects.select_related('product').all()

        for variant in variants:
            # Kiểm tra nếu price của variant lớn hơn price_show của product
            if variant.price > variant.product.price_show:
                # Cập nhật giá của variant = price_show
                variant.price = variant.product.price_show
                variant.save(update_fields=['price'])
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Cập nhật thành công {updated_count} ProductVariant.")
        )
