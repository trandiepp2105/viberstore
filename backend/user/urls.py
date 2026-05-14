from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LogoutView, LoginView, RefreshTokenView, PasswordRessetView, VerifyEmailOTPView
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
    path('auth/reset-password/', PasswordRessetView.as_view(), name='forgot_password'),
    # path('auth/', include('allauth.urls')),
]  
