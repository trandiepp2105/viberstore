from django.urls import path
from payment import views
urlpatterns = [
    path('payment-methods/', views.PaymentMethodListAPIView.as_view(), name='payment-method-list'),
    path('payments/', views.PaymentListCreateAPIView.as_view(), name='payment-list-create'),
    path('process-payment/', views.ProcessPaymentAPIView.as_view(), name='process-payment'),
]