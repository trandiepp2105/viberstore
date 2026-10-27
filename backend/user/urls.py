from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    LogoutView,
    PasswordResetCompleteView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    RefreshTokenView,
    RegisterView,
    VerifyEmailOTPView,
)
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,  # Login
#     TokenRefreshView      # Refresh token
# )

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    # path('verify-email', VerifyEmailView.as_view(), name='verify_email'),
    path('auth/verify-email/', VerifyEmailOTPView.as_view(), name='verify_email'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh-token/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='token_blacklist'),      # Logout
    path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('auth/password-reset/complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    # path('auth/', include('allauth.urls')),
]  
