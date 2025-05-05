from django.urls import include, path

urlpatterns = [
    path("", include("user.urls"), name="user"),
    path("", include("product.urls"), name="product"),
    path("", include("marketing.urls"), name="feedback"),
    path("", include("feedback.urls"), name="feedback"),
    path("", include("order.urls"), name="order"),
    path("", include("cart.urls"), name="cart"),
    path("", include("address.urls"), name="address"),
    path("", include("payment.urls"), name="payment"),
]