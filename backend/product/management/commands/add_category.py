from django.core.management.base import BaseCommand
from product.models import Category
from django.db import transaction


class Command(BaseCommand):
    help = "Add parent and child categories to the database"

    def handle(self, *args, **kwargs):
        # Danh sách các category cha và con
        categories = {
            "LAPTOP": [
                "LAPTOP_ACER", "LAPTOP_ASUS", "LAPTOP_DELL", "LAPTOP_GIGABYTE",
                "LAPTOP_HP", "LAPTOP_LENOVO", "LAPTOP_MACBOOK", "LAPTOP_MSI",
                "LAPTOP_SURFACE", "LAPTOP_VAIO"
            ],
            "MOBILE": [
                "MOBILE_APPLE", "MOBILE_ASUS", "MOBILE_OPPO", "MOBILE_REALME",
                "MOBILE_SAMSUNG", "MOBILE_VIVO", "MOBILE_XIAOMI"
            ],
            "ACCESSORY": [
                "ACCESSORY_APPLE", "ACCESSORY_MOUSE_AND_KEYBOARD", "ACCESSORY_POWER_BANK",
                "ACCESSORY_PHONE_CHARGER", "ACCESSORY_NETWORK_DEVICE"
            ],
            "TABLET": [
                "TABLET_HAUWEI", "TABLET_IPAD", "TABLET_LENOVO", "TABLET_SAMSUNG",
                "TABLET_TECLAST", "TABLET_XIAOMI"
            ],
            "HEADPHONE": [
                "HEADPHONE_WIRED", "HEADPHONE_GAMING", "HEADPHONE_OVER_EAR",
                "HEADPHONE_BLUETOOTH", "HEADPHONE_IN_EAR", "HEADPHONE_SPORT"
            ],
            "WATCH": [
                "WATCH_KIDS_SMARTWATCH", "WATCH_BLOOD_PRESSURE_MONITOR", "WATCH_SPORT",
                "WATCH_WATER_RESISTANT", "WATCH_CALLING", "WATCH_SMART_BAND"
            ]
        }

        # Tạo các category cha và con
        for parent_name, subcategories in categories.items():
            # Tạo category cha
            parent_category, created_parent = Category.objects.get_or_create(name=parent_name)
            if created_parent:
                self.stdout.write(self.style.SUCCESS(f"Created parent category: {parent_name}"))
            else:
                self.stdout.write(f"Parent category {parent_name} already exists.")

            # Tạo các category con
            for subcategory_name in subcategories:
                _, created_child = Category.objects.get_or_create(
                    name=subcategory_name,
                    parent=parent_category
                )
                if created_child:
                    self.stdout.write(self.style.SUCCESS(f"  Created child category: {subcategory_name}"))
                else:
                    self.stdout.write(f"  Child category {subcategory_name} already exists.")

        self.stdout.write(self.style.SUCCESS("All categories have been processed!"))
