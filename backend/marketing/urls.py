from django.urls import path
# from .views import CouponListCreateAPIView, CouponDetailAPIView

# urlpatterns = [
#     path('coupons/', CouponListCreateAPIView.as_view(), name='coupon-list-create'),
#     path('coupons/<int:coupon_id>/', CouponDetailAPIView.as_view(), name='coupon-detail'),
# ]

from marketing import views

urlpatterns = [
    # Promotion URLs (Admin)
    path('promotions/', views.PromotionListCreateAPIView.as_view(), name='promotion-list-create'),
    path('promotions/<int:pk>/', views.PromotionDetailAPIView.as_view(), name='promotion-detail'),
    path('promotions/assign/', views.PromotionAssignmentAPIView.as_view(), name='promotion-assign'), # Use POST for assign
    path('promotions/remove/', views.PromotionAssignmentAPIView.as_view(), name='promotion-remove'), # Use DELETE for remove

    # Coupon URLs (Admin Management, User Validation)
    path('coupons/', views.CouponListCreateAPIView.as_view(), name='coupon-list-create'),
    path('coupons/<int:pk>/', views.CouponDetailAPIView.as_view(), name='coupon-detail'),
    path('coupons/validate/', views.CouponValidateAPIView.as_view(), name='coupon-validate'), # User action

    # Coupon Usage URLs (Admin Read)
    path('coupons/usage/', views.CouponUsageListAPIView.as_view(), name='coupon-usage-list'),
]