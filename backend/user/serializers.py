from rest_framework import serializers
from .models import User
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
# from django.contrib.auth.models import User
from user.models import User
from rest_framework.status import HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED
from django.core.cache import cache
from user.email_conf import hash_email

class UserSimpleSerializer(serializers.ModelSerializer):
     class Meta:
         model = User
         fields = ['id', 'username', 'first_name', 'last_name'] # Or email


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')

        # Kiểm tra OTP có trong cache không
        cached_otp = cache.get(hash_email(email))
        if not cached_otp or cached_otp != otp:
            raise serializers.ValidationError("OTP không hợp lệ hoặc đã hết hạn.")

        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email

        return token
        
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Kiểm tra tài khoản có tồn tại
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed(
                detail="User does not exist",
                code=HTTP_404_NOT_FOUND
            )

        # Kiểm tra mật khẩu
        if not user.check_password(password):
            raise AuthenticationFailed(
                detail="Incorrect password",
                code=HTTP_401_UNAUTHORIZED
            )

        # Gọi validate gốc để lấy token
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone_number','password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Tạo mới user với dữ liệu đã được xác thực
        instance = self.Meta.model(**validated_data)
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email không tồn tại.")
        return value

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        # Kiểm tra email tồn tại
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email không tồn tại."})

        # Kiểm tra OTP trong cache
        key = hash_email(email)
        cached_otp = cache.get(key)
        if not cached_otp or cached_otp != otp:
            raise serializers.ValidationError({"otp": "OTP không hợp lệ hoặc đã hết hạn."})

        return data

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email không tồn tại.")
        return value

    def save(self):
        email = self.validated_data['email']
        new_password = self.validated_data['new_password']

        # Cập nhật mật khẩu
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()

        # Xóa OTP khỏi cache
        cache.delete(f"otp_{email}")
        return user
