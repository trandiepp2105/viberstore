from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from address.models import DeliveryAddress, Province, District, Ward

class DeliveryAddressService:
    """Service class for managing DeliveryAddress operations."""

    @staticmethod
    def add_address(user, data):
        """Add a new delivery address for a user."""
        has_existing_addresses = DeliveryAddress.objects.filter(user=user).exists()
        
        if not has_existing_addresses:
            # If no existing addresses, set the new address as default
            data['is_default'] = True
        elif data.get('is_default'):
            # If there are existing addresses and the new one is marked as default
            DeliveryAddress.objects.filter(user=user).update(is_default=False)
        
        return DeliveryAddress.objects.create(user=user, **data)

    @staticmethod
    def get_user_addresses(user):
        """Retrieve all delivery addresses for a user."""
        return DeliveryAddress.objects.filter(user=user).order_by('-is_default', '-created_at')

    @staticmethod
    def update_address(address_id, user, data):
        """Update an existing delivery address."""
        try:
            address = DeliveryAddress.objects.get(id=address_id, user=user)
            if data.get('is_default'):
                DeliveryAddress.objects.filter(user=user).update(is_default=False)
            for key, value in data.items():
                setattr(address, key, value)
            address.save()
            return address
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def delete_address(address_id, user):
        """Delete a specific delivery address."""
        deleted_count, _ = DeliveryAddress.objects.filter(id=address_id, user=user).delete()
        return deleted_count > 0

    @staticmethod
    @transaction.atomic
    def set_default_address(address_id, user):
        """Set a specific delivery address as default."""
        try:
            DeliveryAddress.objects.filter(user=user).update(is_default=False)
            address = DeliveryAddress.objects.get(id=address_id, user=user)
            address.is_default = True
            address.save()
            return address
        except ObjectDoesNotExist:
            return None

class LocationService:
    """Service class for managing location-related operations."""

    @staticmethod
    def get_provinces():
        """Retrieve all provinces."""
        return Province.objects.all()

    @staticmethod
    def get_districts_by_province(province_id):
        """Retrieve districts by province ID."""
        return District.objects.filter(province_id=province_id)

    @staticmethod
    def get_wards_by_district(district_id):
        """Retrieve wards by district ID."""
        return Ward.objects.filter(district_id=district_id)
