from django.core.management.base import BaseCommand
from product.models import Product, ProductVariant
from decimal import Decimal, InvalidOperation

class Command(BaseCommand):
    help = "Convert price fields from string to Decimal format"

    def handle(self, *args, **kwargs):
        # Convert Product prices
        products = Product.objects.all()
        for product in products:
            try:
                if product.price_show:
                    product.price_show = Decimal(product.price_show)
                if product.price_through:
                    product.price_through = Decimal(product.price_through)
                product.save()
                self.stdout.write(
                    self.style.SUCCESS(f"Successfully converted prices for product: {product.name}")
                )
            except InvalidOperation as e:
                self.stderr.write(
                    self.style.ERROR(f"Error converting price for product {product.name}: {e}")
                )

        # Convert ProductVariant prices
        variants = ProductVariant.objects.all()
        for variant in variants:
            try:
                if variant.price:
                    variant.price = Decimal(variant.price)
                    variant.save()
                    self.stdout.write(
                        self.style.SUCCESS(f"Successfully converted price for variant: {variant.name}")
                    )
            except InvalidOperation as e:
                self.stderr.write(
                    self.style.ERROR(f"Error converting price for variant {variant.name}: {e}")
                )
