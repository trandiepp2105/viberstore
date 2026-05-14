from rest_framework import serializers
from address.models import DeliveryAddress, Province, District, Ward

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['id', 'name', 'code', 'code_name']

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'name', 'code', 'code_name']

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = ['id', 'name', 'code', 'code_name']

class DeliveryAddressSerializer(serializers.ModelSerializer):
    province_city_details = ProvinceSerializer(source='province_city', read_only=True)
    district_details = DistrictSerializer(source='district', read_only=True)
    ward_commune_details = WardSerializer(source='ward_commune', read_only=True)

    class Meta:
        model = DeliveryAddress
        fields = [
            'id', 'user', 'recipient_name', 'is_default', 'name', 
            'province_city', 'province_city_details', 
            'district', 'district_details', 
            'ward_commune', 'ward_commune_details', 
            'specific_address', 'phone_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
