# user/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework import status  # Import status codes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import User
from .security import create_access_token
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.settings import api_settings
from rest_framework.status import HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED
from user.serializers import CustomTokenObtainPairSerializer, VerifyEmailSerializer, VerifyOTPSerializer, ResetPasswordSerializer
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.views import TokenRefreshView
from user.email_conf import send_html_email, hash_email
from django.core.cache import cache

# logging info
import logging

logger = logging.getLogger(__name__)



class RegisterView(APIView):
    permission_classes = []  # Không yêu cầu authentication cho register
    
    @swagger_auto_schema(request_body=UserSerializer)
    def post(self, request):
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

    serializer_class = CustomTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
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
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: "Logout successful", 401: "Invalid token"}
    )
    def post(self, request):
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

# class CustomTokenRefreshView(TokenRefreshView):
#     def post(self, request, *args, **kwargs):
#         # Bạn có thể thêm logic kiểm tra thêm trước khi làm mới token nếu cần
#         # Ví dụ: Kiểm tra token trong request
        
#         # Gọi super() để duy trì hành vi mặc định của TokenRefreshView
#         response = super().post(request, *args, **kwargs)

#         # Nếu bạn muốn tùy chỉnh response, có thể chỉnh sửa ở đây
#         # Ví dụ: Thêm thông tin vào response
#         response.data["message"] = "Token refresh thành công"
        
#         return response

class RefreshTokenView(APIView):
    permission_classes = []
    @swagger_auto_schema(
        responses={
            200: "New access token created",
            401: "Invalid or expired refresh token",
        }
    )
    def post(self, request):
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
    @swagger_auto_schema(
        request_body=VerifyOTPSerializer,
        responses={
            200: "OTP xác thực thành công",
            400: "OTP không hợp lệ hoặc đã hết hạn"
        }
    )
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            User.objects.filter(email=email).update(is_verify=True)

            return Response({"message": "Xác thực OTP thành công."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordRessetView(APIView):
    """
    Gộp các bước gửi OTP, xác thực OTP và đặt lại mật khẩu vào một view với tham số `step`.
    """
    def post(self, request):
        step = request.query_params.get('step')

        if step == '1':
            # Bước 1: Gửi OTP
            serializer = VerifyEmailSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data["email"]
                user = User.objects.filter(email=email).first()

                if not user:
                    return Response(
                        {"message": "Người dùng không tồn tại."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                # Gửi OTP qua email
                send_html_email(email)
                return Response(
                    {"message": "OTP đã được gửi đến email của bạn."},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif step == '2':
            # Bước 2: Xác thực OTP
            serializer = VerifyOTPSerializer(data=request.data)
            if serializer.is_valid():
                return Response({"message": "Xác thực OTP thành công."}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif step == '3':
            # Bước 3: Đặt lại mật khẩu
            serializer = ResetPasswordSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Cập nhật mật khẩu thành công."}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            # Tham số `step` không hợp lệ
            return Response(
                {"message": "Invalid step."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
# class ForgotPasswordRequestView(APIView):
#     """
#     Gửi OTP đến email của người dùng để đặt lại mật khẩu.
#     """

#     @swagger_auto_schema(
#         operation_description="Gửi OTP đến email để đặt lại mật khẩu.",
#         request_body=VerifyEmailSerializer,
#     )
#     def post(self, request):
#         serializer = VerifyEmailSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data["email"]
#             user = User.objects.filter(email=email).first()

#             if not user:
#                 return Response(
#                     {"message": "Người dùng không tồn tại."},
#                     status=status.HTTP_404_NOT_FOUND,
#                 )

#             # Gửi OTP qua email
#             send_html_email(email)
#             return Response(
#                 {"message": "OTP đã được gửi đến email của bạn."},
#                 status=status.HTTP_200_OK,
#             )

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class VerifyOTPView(APIView):
#     def post(self, request):
#         serializer = VerifyOTPSerializer(data=request.data)
#         if serializer.is_valid():
#             # OTP hợp lệ, trả về trạng thái xác thực thành công
#             return Response({"message": "Xác thực OTP thành công."}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class ResetPasswordView(APIView):
#     def post(self, request):
#         serializer = ResetPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "Cập nhật mật khẩu thành công."}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class PasswordRessetView(APIView):
#     def post(self, request):
#         step = request.query_params.get('step')

#         if step == '1':
#             return ForgotPasswordRequestView.as_view()(request)
#         elif step == '2':
#             return VerifyOTPView.as_view()(request)
#         elif step == '3':
#             return ResetPasswordView.as_view()(request)
#         else:
#             return Response(
#                 {"message": "Invalid step."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )