from django.urls import path
from address import views
urlpatterns = [
    path('delivery-addresses/', views.DeliveryAddressView.as_view(), name='delivery-address-list-create'),
    path('delivery-addresses/<int:address_id>/', views.DeliveryAddressDetailView.as_view(), name='delivery-address-detail'),
    path('delivery-addresses/<int:address_id>/set-default/', views.SetDefaultAddressView.as_view(), name='set-default-delivery-address'),
    path('provinces/', views.ProvinceListView.as_view(), name='province-list'),
    path('provinces/<int:province_id>/districts/', views.DistrictListView.as_view(), name='district-list'),
    path('districts/<int:district_id>/wards/', views.WardListView.as_view(), name='ward-list'),

]