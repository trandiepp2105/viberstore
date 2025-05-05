from django.core.management.base import BaseCommand
from product.models import ProductCategory, Category

class Command(BaseCommand):
    help = 'Add parent categories to ProductCategory for each product in subcategories'

    def handle(self, *args, **kwargs):
        # Lấy tất cả các bản ghi trong ProductCategory
        product_categories = ProductCategory.objects.select_related('category', 'product')

        count_added = 0
        for product_category in product_categories:
            subcategory = product_category.category
            product = product_category.product

            # Kiểm tra nếu subcategory có parent
            while subcategory.parent:
                parent_category = subcategory.parent

                # Kiểm tra nếu quan hệ đã tồn tại
                if not ProductCategory.objects.filter(product=product, category=parent_category).exists():
                    # Tạo mới nếu chưa có
                    ProductCategory.objects.create(product=product, category=parent_category)
                    count_added += 1

                # Chuyển lên category cha tiếp theo
                subcategory = parent_category

        self.stdout.write(self.style.SUCCESS(f'{count_added} parent category relationships added.'))
