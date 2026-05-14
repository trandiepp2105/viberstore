# cart_app/urls.py
from django.urls import path
from cart import views # Import the APIView classes from views.py


urlpatterns = [
    # --- Cart Endpoint ---
    # Handles GET (List), POST (Add/Update Item), DELETE (Clear Cart)
    # Example URL: /api/cart/
    path('cart/', views.CartView.as_view(), name='cart-view'),
    path('cart/bulk-delete/', views.BulkDeleteCartItemsView.as_view(), name='bulk-delete-cart'),
    # --- Cart Item Detail Endpoint ---
    # Handles PUT/PATCH (Update Quantity), DELETE (Remove Item) for a specific item
    # Example URL: /api/cart/{cart_item_pk}/
    path('cart/<int:pk>/', views.CartItemDetailView.as_view(), name='cart-item-detail'),
]