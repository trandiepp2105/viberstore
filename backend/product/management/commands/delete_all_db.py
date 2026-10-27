import pandas as pd
from product.models import Product, ProductImage, Category, ProductCategory, Series, ProductVariant, Attribute, Specification
import json
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    """Xóa dữ liệu catalog theo phạm vi mà command chỉ định để phục vụ bảo trì/import lại."""
    help = 'Closes the specified poll for voting'
    def handle(self, *args, **options):
        """Thực thi lệnh quản trị với các tham số đầu vào được cung cấp."""
        ProductImage.objects.all().delete()
        ProductCategory.objects.all().delete()
        ProductVariant.objects.all().delete()
        Specification.objects.all().delete()
        Attribute.objects.all().delete()
        Series.objects.all().delete()
        Product.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'All data deleted!'))
