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
     """Serializer `UserSimpleSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: cấu hình field/Meta."""
     class Meta:
         """Khai báo metadata cho `UserSimpleSerializer`, gồm: model, fields."""
         model = User
         fields = ['id', 'username', 'first_name', 'last_name'] # Or email


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer `VerifyEmailSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: email, otp, validate()."""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)

    def validate(self, data):
        """Xử lý `validate` của serializer `VerifyEmailSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
        email = data.get('email')
        otp = data.get('otp')

        # Kiểm tra OTP có trong cache không
        cached_otp = cache.get(hash_email(email))
        if not cached_otp or cached_otp != otp:
            raise serializers.ValidationError("OTP không hợp lệ hoặc đã hết hạn.")

        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer `CustomTokenObtainPairSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: get_token(), validate()."""

    @classmethod
    def get_token(cls, user):
        """Xử lý `get_token` của serializer `CustomTokenObtainPairSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
        token = super().get_token(user)
        token['email'] = user.email

        return token
        
    def validate(self, attrs):
        """Xử lý `validate` của serializer `CustomTokenObtainPairSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
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
    """Serializer `UserSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: create()."""
    class Meta:
        """Khai báo metadata cho `UserSerializer`, gồm: model, fields, extra_kwargs."""
        model = User
        fields = ['id', 'name', 'email', 'phone_number','password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Xử lý `create` của serializer `UserSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
        # Tạo mới user với dữ liệu đã được xác thực
        instance = self.Meta.model(**validated_data)
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer `VerifyEmailSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: email, validate_email()."""
    email = serializers.EmailField()

    def validate_email(self, value):
        """Xử lý `validate_email` của serializer `VerifyEmailSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email không tồn tại.")
        return value

class VerifyOTPSerializer(serializers.Serializer):
    """Serializer `VerifyOTPSerializer` của domain `user`, chịu trách nhiệm validate và chuyển đổi payload API. Thành phần chính: email, otp, validate()."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        """Xử lý `validate` của serializer `VerifyOTPSerializer` để validate, tạo hoặc biểu diễn dữ liệu API."""
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

class PasswordResetRequestSerializer(serializers.Serializer):
    """Validate the email submitted to request a password reset OTP."""

    email = serializers.EmailField()


class PasswordResetVerifySerializer(serializers.Serializer):
    """Validate the email and OTP used to exchange an OTP for a reset token."""

    email = serializers.EmailField()
    otp = serializers.RegexField(regex=r"^\d{6}$", max_length=6, min_length=6)


class PasswordResetCompleteSerializer(serializers.Serializer):
    """Validate a reset-only token and proposed replacement password."""

    reset_token = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
