from django.core.management.base import BaseCommand
from product.models import Product, ProductImage

class Command(BaseCommand):
    help = 'Cập nhật main_image_url cho tất cả các sản phẩm từ ProductImage có is_main=True'

    def handle(self, *args, **kwargs):
        # Lấy tất cả các sản phẩm
        products = Product.objects.all()
        updated_count = 0

        for product in products:
            # Tìm ProductImage có is_main=True cho sản phẩm hiện tại
            main_image = ProductImage.objects.filter(product=product, is_main=True).first()
            if main_image:
                # Cập nhật main_image_url
                product.main_image_url = main_image.url
                product.save()
                updated_count += 1
                self.stdout.write(f"Updated main_image_url for Product ID {product.id}")

        self.stdout.write(f"Successfully updated main_image_url for {updated_count} products.")
