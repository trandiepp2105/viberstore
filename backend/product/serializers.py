from rest_framework import serializers
from product.models import (
    Supplier, Product, Category, ProductCategory, Size, Color, ProductVariant
)
from .enums import SupplierStatus # Giả sử enum này được định nghĩa trong product_app/enums.py
from decimal import Decimal # Import Decimal nếu bạn chuyển giá sang DecimalField

# import các hàm cần thiết
from django.db.models import Sum
# --- Base Serializers (Không có quan hệ phức tạp) ---
from product.utils import convert_image_to_jpeg
class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = [
            'id', 'company_name', 'slug', 'contact_person', 'email',
            'phone_number', 'address', 'tax_id', 'status',
            'website', 'started_at' # Hiển thị ID các product liên quan
        ]
        read_only_fields = ('id','slug') # Slug tự tạo, products là related_name

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'description']
        read_only_fields = ('id',)

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code', 'description']
        read_only_fields = ('id',)
class BaseCategorySerializer(serializers.ModelSerializer):
    """
    Serializer cho Category không có quan hệ phức tạp.
    Chỉ dùng cho các trường đơn giản và không có lồng nhau.
    """
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'image_url',
            'parent', # Trường cha (nếu có), không cần serialize lại
        ]
        read_only_fields = ('id','slug',)

class RecursiveCategorySerializer(serializers.ModelSerializer):
    """
    Serializer cho Category bao gồm các subcategories lồng nhau.
    Sử dụng chính Serializer này một cách đệ quy.
    """
    # Sử dụng SerializerMethodField để gọi đệ quy và có kiểm soát
    subcategories = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'image_url',
            'subcategories', # Trường chứa danh sách các subcategories đã được serialize
            'parent',       # Trường cha (nếu có), không cần serialize lại
        ]
        # Không cần liệt kê 'parent' ở đây
        read_only_fields = ('id','slug',)

    def get_subcategories(self, obj: Category):
        """
        Lấy và serialize các subcategories trực tiếp của category hiện tại (obj).
        """
        # Lấy tất cả các subcategories liên quan (nhờ related_name='subcategories')
        # Bạn có thể thêm filter ở đây nếu cần, ví dụ: chỉ lấy active subcategories
        # lấy subcategories bằng cách lấy những category có parent là obj
        subcategories_queryset = Category.objects.filter(parent=obj).order_by('name')

        # Serialize danh sách các subcategories này bằng chính serializer hiện tại
        # Quan trọng: truyền context để đảm bảo các thông tin như request (nếu cần cho ImageField URL) được giữ nguyên
        serializer = RecursiveCategorySerializer(subcategories_queryset, many=True, context=self.context)
        return serializer.data

# alias for RecursiveCategorySerializer
CategorySerializer = RecursiveCategorySerializer


class ProductSerializer(serializers.ModelSerializer):
    # --- Xử lý Supplier ---
    # 1. Trường chỉ đọc, trả về dữ liệu Supplier đã được serialize lồng nhau
    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    # 2. Trường chỉ ghi, dùng để nhận supplier_id khi tạo/cập nhật Product
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        write_only=True # Chỉ dùng cho input, không hiển thị trong output
    )
    category_id = serializers.IntegerField(write_only=True, required=False)
    stock = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'supplier',         # Chỉ dùng để ghi (write_only)
            'supplier_details', # Chỉ dùng để đọc (read_only), chứa thông tin lồng nhau
            'name',
            'slug',
            'description',
            'cost_price',
            'price',
            'sale_price',
            'is_published',
            'publish_at',
            'image_url',        # Đảm bảo URL đầy đủ được tạo (cần 'request' trong context)
            'category_id',      # ID của category (để tạo mới hoặc cập nhật)
            'stock',            # Read-only field for total stock
            # Loại bỏ 'variants', 'categories', 'category_details'
        ]
        read_only_fields = (
            'slug',             # Tự tạo trong model.save
            'supplier_details', # Là read_only theo định nghĩa field
            'effective_price',  # Là read_only theo định nghĩa field
            'is_published',     # Là read_only theo định nghĩa field
            'stock',            # Mark stock as read-only
        )
        # Không cần write_only_fields vì đã đặt write_only=True trên field 'supplier'
    def validate_image_url(self, value):
        return convert_image_to_jpeg(value)
    def get_stock(self, obj):
        """
        Calculate the total stock by summing up the stock of all related ProductVariant instances.
        """
        return obj.variants.aggregate(total_stock=Sum('stock'))['total_stock'] or 0

class ProductVariantSerializer(serializers.ModelSerializer):
    # --- Xử lý Product (Nested Read, ID Write) ---

    # --- Xử lý Color (Nested Read, ID Write) ---
    color_details = ColorSerializer(source='color', read_only=True, allow_null=True)

    # --- Xử lý Size (Nested Read, ID Write) ---
    size_details = SizeSerializer(source='size', read_only=True, allow_null=True)
    product_details = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',          # Write-only ID
            'product_details',    # Read-only Nested Object (optional)
            'size',             # Write-only ID (optional)
            'size_details',     # Read-only Nested Object (optional)
            'color',            # Write-only ID (optional)
            'color_details',    # Read-only Nested Object (optional)
            'sku',
            'stock',            # Số lượng tồn kho thực tế
            'image_url',        # Đảm bảo URL đầy đủ (cần context request)
            'weight_grams',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = (
            'id',
            'product_details',
            'size_details',
            'color_details',
            'created_at',
            'updated_at'
        )
        # unique_together validator vẫn dùng các trường ID (product, size, color)
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ProductVariant.objects.all(),
                fields=('product', 'size', 'color'), # Dùng trường ID để validate
                message="This variant (size/color combination) already exists for this product."
            )
        ]

