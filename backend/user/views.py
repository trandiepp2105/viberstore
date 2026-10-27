# user/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework import status  # Import status codes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import User
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.settings import api_settings
from rest_framework.status import HTTP_401_UNAUTHORIZED
from user.serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetCompleteSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    VerifyOTPSerializer,
)
from user.email_conf import send_html_email
from .services import PasswordResetService
from .throttling import (
    PasswordResetIPThrottle,
    PasswordResetRequestEmailThrottle,
    PasswordResetVerifyEmailThrottle,
)

# logging info
import logging

logger = logging.getLogger(__name__)



class RegisterView(APIView):
    """API view `RegisterView` của domain `user`, chịu trách nhiệm nhận request, gọi serializer/service và trả response. HTTP methods: post()."""
    permission_classes = []  # Không yêu cầu authentication cho register
    
    @swagger_auto_schema(request_body=UserSerializer)
    def post(self, request):
        """Xử lý HTTP `POST` của API view `RegisterView` trong domain `user`, nhận request và trả response phù hợp."""
        data = request.data
        email = data.get("email")

        # Kiểm tra user tồn tại
        user = User.objects.filter(email=email).first()
        if user:
            if not user.is_verify:
                # Gửi OTP nếu tài khoản chưa được xác thực
                send_html_email(email)
                return Response({"detail": "OTP sent to the registered email."}, status=200)
            else:
                # Trả lỗi nếu tài khoản đã xác thực
                return Response({"detail": "User with this email already exists."}, status=400)

        # Nếu user chưa tồn tại, tạo tài khoản mới
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            send_html_email(user.email)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# class VerifyEmailView(APIView):

#     @swagger_auto_schema(request_body=VerifyEmailSerializer)
#     def post(self, request):
#         serializer = VerifyEmailSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']

#             # Xác thực email
#             user = User.objects.filter(email=email).first()
#             if not user:
#                 return Response({"message": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

#             email = user.email
#             send_html_email(email)

#             return Response({"message": "Đã gửi OTP xác thực!"}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """API view `LoginView` của domain `user`, chịu trách nhiệm nhận request, gọi serializer/service và trả response. HTTP methods: post()."""

    serializer_class = CustomTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        """Xử lý HTTP `POST` của API view `LoginView` trong domain `user`, nhận request và trả response phù hợp."""
        response = super().post(request, *args, **kwargs)
        data = response.data

        # Set cookies
        access_token = data.get('access')
        refresh_token = data.get('refresh')
        access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME
        refresh_token_lifetime = api_settings.REFRESH_TOKEN_LIFETIME
        if access_token:
            response.set_cookie(
                key='access',
                value=access_token,
                httponly=False,  # Bảo mật cookie, không truy cập được từ JavaScript
                max_age=access_token_lifetime.total_seconds(),  # Thời gian sống của cookie
                secure=False,  # Chỉ cho phép trên HTTPS (tắt nếu là localhost)
                samesite="Lax" # Chính sách gửi cookie (Lax hoặc Strict)
            )
        if refresh_token:
            response.set_cookie(
                key='refresh',
                value=refresh_token,
                httponly=False,
                max_age=refresh_token_lifetime.total_seconds(),
                secure=False,
                samesite="Lax"
            )

        return response

class LogoutView(APIView):
    """API view `LogoutView` của domain `user`, chịu trách nhiệm nhận request, gọi serializer/service và trả response. HTTP methods: post()."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: "Logout successful", 401: "Invalid token"}
    )
    def post(self, request):
        """Xử lý HTTP `POST` của API view `LogoutView` trong domain `user`, nhận request và trả response phù hợp."""
        try:
            refresh_token = request.COOKIES.get('refresh')
            if not refresh_token:
                return Response(    
                    {"message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # deleted, _ = OutstandingToken.objects.filter(token=refresh_token).delete()
            # if deleted == 0:
            #     return Response(
            #         {"message": "Token not found or already deleted."},
            #         status=status.HTTP_404_NOT_FOUND,
            #     )

            # Kiểm tra xem refresh token có hợp lệ hay không
            token = RefreshToken(refresh_token)
            # Thu hồi refresh token (có thể làm một cách đơn giản là xóa nó đi)
            token.set_exp(lifetime=timedelta(seconds=0))

            # Xóa cookie refresh token trên client
            response = Response(
                {"message": "Logout successful!"},
                status=status.HTTP_200_OK
            )
            access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME
            refresh_token_lifetime = api_settings.REFRESH_TOKEN_LIFETIME
            # Xóa cookie trên client

            response.set_cookie(
                key='access',
                value="",
                httponly=False,  # Bảo mật cookie, không truy cập được từ JavaScript
                max_age=15,  # Thời gian sống của cookie
                secure=False,  # Chỉ cho phép trên HTTPS (tắt nếu là localhost)
                samesite="Lax" # Chính sách gửi cookie (Lax hoặc Strict)
            )
            response.set_cookie(
                key='refresh',
                value="",
                httponly=False,
                max_age=15,
                secure=False,
                samesite="Lax"
            )
            # response.delete_cookie('refresh', path='/')
            # response.delete_cookie('access', path='/')
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            return response

        except Exception as e:
            print("Error: ", e)
            raise AuthenticationFailed('Invalid token')

class RefreshTokenView(APIView):
    """API view `RefreshTokenView` của domain `user`, chịu trách nhiệm nhận request, gọi serializer/service và trả response. HTTP methods: post()."""
    permission_classes = []
    @swagger_auto_schema(
        responses={
            200: "New access token created",
            401: "Invalid or expired refresh token",
        }
    )
    def post(self, request):
        """Xử lý HTTP `POST` của API view `RefreshTokenView` trong domain `user`, nhận request và trả response phù hợp."""
        print("Refresh token request: ", request.COOKIES)
        logger.info(f"Refresh token request: {request.COOKIES}")
        try:
            # Lấy refresh token từ cookie
            refresh_token = request.COOKIES.get('refresh')
            if not refresh_token:
                return Response(
                    {"message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Kiểm tra refresh token hợp lệ
            try:
                token = RefreshToken(refresh_token)
            except Exception:
                raise AuthenticationFailed('Invalid or expired refresh token')

            # Tạo access token mới
            access_token = str(token.access_token)

            # Gửi lại access token cho client
            response = Response(
                {"message": "Access token refreshed successfully!"},
                status=status.HTTP_200_OK
            )
            access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME

            response.set_cookie(
                key='access',
                value=access_token,
                httponly=False,  # Bảo mật cookie, không truy cập được từ JavaScript
                max_age=access_token_lifetime.total_seconds(),  # Thời gian sống của cookie
                secure=False,  # Chỉ cho phép trên HTTPS (tắt nếu là localhost)
                samesite="Lax" # Chính sách gửi cookie (Lax hoặc Strict)
            )

            return response

        except AuthenticationFailed as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            print("Error: ", e)
            return Response(
                {"message": "An error occurred while refreshing the token."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class VerifyEmailOTPView(APIView):
    """API view `VerifyEmailOTPView` của domain `user`, chịu trách nhiệm nhận request, gọi serializer/service và trả response. HTTP methods: post()."""
    @swagger_auto_schema(
        request_body=VerifyOTPSerializer,
        responses={
            200: "OTP xác thực thành công",
            400: "OTP không hợp lệ hoặc đã hết hạn"
        }
    )
    def post(self, request):
        """Xử lý HTTP `POST` của API view `VerifyEmailOTPView` trong domain `user`, nhận request và trả response phù hợp."""
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            User.objects.filter(email=email).update(is_verify=True)

            return Response({"message": "Xác thực OTP thành công."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """Request a reset OTP without disclosing whether an account exists."""

    permission_classes = []
    throttle_classes = [PasswordResetIPThrottle, PasswordResetRequestEmailThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PasswordResetService.request_reset(serializer.validated_data["email"])
        return Response(
            {"message": "Nếu email đã đăng ký, mã xác minh sẽ được gửi đến hộp thư."},
            status=status.HTTP_202_ACCEPTED,
        )


class PasswordResetVerifyView(APIView):
    """Exchange a valid OTP for a short-lived, reset-only token."""

    permission_classes = []
    throttle_classes = [PasswordResetIPThrottle, PasswordResetVerifyEmailThrottle]

    @swagger_auto_schema(request_body=PasswordResetVerifySerializer)
    def post(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_token = PasswordResetService.verify_otp(
            email=serializer.validated_data["email"],
            otp=serializer.validated_data["otp"],
        )
        return Response(
            {"reset_token": reset_token, "expires_in": 600},
            status=status.HTTP_200_OK,
        )


class PasswordResetCompleteView(APIView):
    """Change a password using a valid reset-only token; authentication is not needed."""

    permission_classes = []
    throttle_classes = [PasswordResetIPThrottle]

    @swagger_auto_schema(request_body=PasswordResetCompleteSerializer)
    def post(self, request):
        serializer = PasswordResetCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PasswordResetService.complete_reset(
            reset_token=serializer.validated_data["reset_token"],
            new_password=serializer.validated_data["new_password"],
        )
        return Response(
            {"message": "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại."},
            status=status.HTTP_200_OK,
        )
