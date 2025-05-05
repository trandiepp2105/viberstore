from django.urls import path
from order import views


urlpatterns = [
    # Order URLs
    path('orders/', views.OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', views.OrderDetailAPIView.as_view(), name='order-detail'),
    path('orders/temporary/', views.TemporaryOrderAPIView.as_view(), name='temporary-order-list-create'),
    path('orders/<int:pk>/cancel/', views.CancelOrderAPIView.as_view(), name='order-cancel'),
    path('orders/<int:pk>/process/', views.ProcessOrderAPIView.as_view(), name='order-process'),
    path('orders/<int:pk>/history/', views.OrderHistoryAPIView.as_view(), name='order-history'),

    # Lookup Table URLs (Admin Only)
    path('order-statuses/', views.OrderStatusListCreateAPIView.as_view(), name='admin-orderstatus-list-create'),
    path('order-statuses/<int:pk>/', views.OrderStatusDetailAPIView.as_view(), name='admin-orderstatus-detail'),
    path('shipping-methods/', views.ShippingMethodListCreateAPIView.as_view(), name='shipping-method-list-create'),
    path('shipping-methods/<int:pk>/', views.ShippingMethodDetailAPIView.as_view(), name='shipping-method-detail'),
    # Add URLs for PaymentMethod etc. following the same pattern

    # URLs for Payment, Returns would be added here as needed
    path('delivery-methods/', views.DeliveryMethodListAPIView.as_view(), name='delivery-methods'),
]