import pandas as pd
from product.models import Product, ProductImage, Category, ProductCategory, Series, ProductVariant, Attribute, Specification
import json
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
    def handle(self, *args, **options):
        ProductImage.objects.all().delete()
        ProductCategory.objects.all().delete()
        ProductVariant.objects.all().delete()
        Specification.objects.all().delete()
        Attribute.objects.all().delete()
        Series.objects.all().delete()
        Product.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'All data deleted!'))

