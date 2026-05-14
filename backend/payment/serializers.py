from rest_framework import serializers
from .models import PaymentStatus, PaymentMethod, Payment

class PaymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentStatus
        fields = ['id', 'code', 'name', 'description']


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'description', 'is_active', 'image_url']


class PaymentSerializer(serializers.ModelSerializer):
    status_details = PaymentStatusSerializer(source='status', read_only=True)
    method_details = PaymentMethodSerializer(source='method', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'status', 'status_details', 'method',
            'method_details', 'transaction_id', 'gateway_response',
            'amount', 'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
