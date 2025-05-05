from django.urls import path
from product import views

urlpatterns = [
    # --- Supplier URLs (Admin Only) ---
    # /api/suppliers/
    path('suppliers/', views.SupplierListCreateAPIView.as_view(), name='supplier-list-create'),
    # /api/suppliers/{pk}/
    path('suppliers/<int:pk>/', views.SupplierDetailAPIView.as_view(), name='supplier-detail'),

    # --- Category URLs (Public Read, Admin Write) ---
    # /api/categories/
    path('categories/', views.CategoryListCreateAPIView.as_view(), name='category-list-create'),
    # /api/categories/{pk}/
    path('categories/<int:pk>/', views.CategoryDetailAPIView.as_view(), name='category-detail'),

    # --- Product URLs (Public Read Published, Admin Write/Read Unpublished) ---
    # /api/products/
    path('products/', views.ProductListCreateAPIView.as_view(), name='product-list-create'),
    # /api/products/{pk}/
    path('products/<int:pk>/', views.ProductDetailAPIView.as_view(), name='product-detail'),
    path("products/<str:slug>/", views.ProductDetailBySlugAPIView.as_view(), name="product-detail-by-slug"),
    # --- Product Variant URLs (Admin Only) ---
    # Cách 1: Endpoint riêng cho tất cả variants (có thể lọc theo product qua query param)
    # /api/variants/
    # path('variants/', views.ProductVariantListCreateAPIView.as_view(), name='variant-list-create-all'),

    # Cách 2: Nested URL (lấy/tạo variant cho product cụ thể) - Thường được ưa chuộng hơn
    # /api/products/{product_pk}/variants/
    path('products/<int:product_pk>/variants/', views.ProductVariantListCreateAPIView.as_view(), name='product-variant-list-create'),
    path("products/<str:slug>/variants/", views.ProductVariantsBySlugAPIView.as_view(), name="product-variant-list-create-by-slug"),
    # /api/products/{product_pk}/categories/
    path('products/<int:product_pk>/categories/', views.ProductCategoriesAPIView.as_view(), name='product-categories'),
    # /api/products/{slug}/categories/
    path('products/<str:slug>/categories/', views.ProductCategoriesBySlugAPIView.as_view(), name='product-categories-by-slug'),
    # Detail view cho variant (dùng chung cho cả 2 cách list)
    # /api/variants/{pk}/
    path('variants/<int:pk>/', views.ProductVariantDetailAPIView.as_view(), name='variant-detail'),

    # --- KHÔNG CÓ URL cho Size và Color theo yêu cầu ---
    # Chúng được quản lý ngầm thông qua Product Variant API
]