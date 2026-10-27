from rest_framework import serializers
from address.models import DeliveryAddress, Province, District, Ward

class ProvinceSerializer(serializers.ModelSerializer):
    """Serializer `ProvinceSerializer` của domain `address`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `ProvinceSerializer`, gồm: model, fields."""
        model = Province
        fields = ['id', 'name', 'code', 'code_name']

class DistrictSerializer(serializers.ModelSerializer):
    """Serializer `DistrictSerializer` của domain `address`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `DistrictSerializer`, gồm: model, fields."""
        model = District
        fields = ['id', 'name', 'code', 'code_name']

class WardSerializer(serializers.ModelSerializer):
    """Serializer `WardSerializer` của domain `address`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `WardSerializer`, gồm: model, fields."""
        model = Ward
        fields = ['id', 'name', 'code', 'code_name']

class DeliveryAddressSerializer(serializers.ModelSerializer):
    """Serializer `DeliveryAddressSerializer` của domain `address`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: province_city_details, district_details, ward_commune_details."""
    province_city_details = ProvinceSerializer(source='province_city', read_only=True)
    district_details = DistrictSerializer(source='district', read_only=True)
    ward_commune_details = WardSerializer(source='ward_commune', read_only=True)

    class Meta:
        """Khai báo metadata cho `DeliveryAddressSerializer`, gồm: model, fields, read_only_fields."""
        model = DeliveryAddress
        fields = [
            'id', 'user', 'recipient_name', 'is_default', 'name', 
            'province_city', 'province_city_details', 
            'district', 'district_details', 
            'ward_commune', 'ward_commune_details', 
            'specific_address', 'phone_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
