from django.core.management.base import BaseCommand
from django.conf import settings
from payment.models import PaymentStatus, PaymentMethod
from django.core.files import File
import os

class Command(BaseCommand):
    help = "Create default payment statuses and methods"

    def handle(self, *args, **kwargs):
        # Create default payment statuses
        statuses = [
            {"code": "PENDING", "name": "Pending", "description": "Payment is pending."},
            {"code": "COMPLETED", "name": "Completed", "description": "Payment has been completed."},
            {"code": "FAILED", "name": "Failed", "description": "Payment has failed."},
            {"code": "REFUNDED", "name": "Refunded", "description": "Payment has been refunded."},
        ]

        for status in statuses:
            obj, created = PaymentStatus.objects.get_or_create(
                code=status["code"],
                defaults={
                    "name": status["name"],
                    "description": status["description"],
                },
            )
            self.stdout.write(
                f"{'Created' if created else 'Skipped'} PaymentStatus: {status['name']}"
            )

        # Create default payment methods
        methods = [
            {
                "code": "COD",
                "name": "Cash on Delivery",
                "description": "Pay with cash upon delivery.",
                "image_filename": "cod.png",
            },
            {
                "code": "VNPAY",
                "name": "Bank Payment",
                "description": "Pay using a bank payment gateway.",
                "image_filename": "vnpay.png",
            },
        ]

        media_path = os.path.join(settings.MEDIA_ROOT, "payment_methods")
        for method in methods:
            image_path = os.path.join(media_path, method["image_filename"])
            if not os.path.exists(image_path):
                self.stderr.write(f"Image file not found: {image_path}")
                continue

            with open(image_path, "rb") as image_file:
                obj, created = PaymentMethod.objects.get_or_create(
                    code=method["code"],
                    defaults={
                        "name": method["name"],
                        "description": method["description"],
                        "is_active": True,
                        "image_url": File(image_file, name=method["image_filename"]),
                    },
                )
                self.stdout.write(
                    f"{'Created' if created else 'Skipped'} PaymentMethod: {method['name']}"
                )

        self.stdout.write(self.style.SUCCESS("Default payment data created successfully."))
