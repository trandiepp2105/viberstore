from rest_framework import serializers
from .models import PaymentStatus, PaymentMethod, Payment

class PaymentStatusSerializer(serializers.ModelSerializer):
    """Serializer `PaymentStatusSerializer` của domain `payment`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `PaymentStatusSerializer`, gồm: model, fields."""
        model = PaymentStatus
        fields = ['id', 'code', 'name', 'description']


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer `PaymentMethodSerializer` của domain `payment`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
    class Meta:
        """Khai báo metadata cho `PaymentMethodSerializer`, gồm: model, fields."""
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'description', 'is_active', 'image_url']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer `PaymentSerializer` của domain `payment`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: status_details, method_details."""
    status_details = PaymentStatusSerializer(source='status', read_only=True)
    method_details = PaymentMethodSerializer(source='method', read_only=True)

    class Meta:
        """Khai báo metadata cho `PaymentSerializer`, gồm: model, fields, read_only_fields."""
        model = Payment
        fields = [
            'id', 'order', 'status', 'status_details', 'method',
            'method_details', 'transaction_id', 'gateway_response',
            'amount', 'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
