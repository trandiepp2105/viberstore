from django.core.management.base import BaseCommand
from order.models import OrderStatus, ShippingMethod, OrderReutrnStatus, DeliveryMethod

class Command(BaseCommand):
    help = "Create default order statuses, shipping methods, and return statuses"

    def handle(self, *args, **kwargs):
        # Create default order statuses
        statuses = [
            {"status_code": "PENDING", "status_name": "Pending", "description": "Order is pending."},
            {"status_code": "PACKED", "status_name": "Packed", "description": "Order has been packed."},
            {"status_code": "DELIVERING", "status_name": "Delivering", "description": "Order is being delivered."},
            {"status_code": "DELIVERED", "status_name": "Delivered", "description": "Order has been delivered."},
            {"status_code": "CANCELLED", "status_name": "Cancelled", "description": "Order has been cancelled."},
            {"status_code": "RETURNED", "status_name": "Returned", "description": "Order has been returned."},
            {"status_code": "REFUNDED", "status_name": "Refunded", "description": "Order has been refunded."},
        ]

        for status in statuses:
            obj, created = OrderStatus.objects.get_or_create(
                status_code=status["status_code"],
                defaults={
                    "status_name": status["status_name"],
                    "description": status["description"],
                },
            )
            self.stdout.write(
                f"{'Created' if created else 'Skipped'} OrderStatus: {status['status_name']}"
            )

        # Create default shipping methods
        shipping_methods = [
            {"method_code": "STANDARD", "method_name": "Standard Shipping", "base_cost": 30000, "description": "Standard shipping method."},
            {"method_code": "EXPRESS", "method_name": "Express Shipping", "base_cost": 50000, "description": "Express shipping method."},
            {"method_code": "SAME_DAY", "method_name": "Same-Day Delivery", "base_cost": 0, "description": "Same-day delivery for inner-city orders."},
        ]

        for method in shipping_methods:
            obj, created = ShippingMethod.objects.get_or_create(
                method_code=method["method_code"],
                defaults={
                    "method_name": method["method_name"],
                    "base_cost": method["base_cost"],
                    "description": method["description"],
                    "is_active": True,
                },
            )
            self.stdout.write(
                f"{'Created' if created else 'Skipped'} ShippingMethod: {method['method_name']}"
            )

        # Create default order return statuses
        return_statuses = [
            {"status_code": "REQUESTED", "status_name": "Requested", "description": "Return has been requested."},
            {"status_code": "APPROVED", "status_name": "Approved", "description": "Return request has been approved."},
            {"status_code": "REJECTED", "status_name": "Rejected", "description": "Return request has been rejected."},
            {"status_code": "COMPLETED", "status_name": "Completed", "description": "Return process has been completed."},
        ]

        for return_status in return_statuses:
            obj, created = OrderReutrnStatus.objects.get_or_create(
                status_code=return_status["status_code"],
                defaults={
                    "status_name": return_status["status_name"],
                    "description": return_status["description"],
                },
            )
            self.stdout.write(
                f"{'Created' if created else 'Skipped'} OrderReutrnStatus: {return_status['status_name']}"
            )

        # Add default delivery methods
        delivery_methods = [
            {"name": "Home delivery", "description": "Deliver to the customer's home", "code": "HOME_DELIVERY"},
            {"name": "In-Store Pickup", "description": "Customer picks up from the store", "code": "IN_STORE_PICKUP"},
        ]

        for method in delivery_methods:
            DeliveryMethod.objects.get_or_create(
                code=method["code"],
                defaults={"name": method["name"], "description": method["description"]},
            )
            self.stdout.write(self.style.SUCCESS(f"Delivery method '{method['name']}' added or already exists."))

        self.stdout.write(self.style.SUCCESS("Default order data created successfully."))
