from rest_framework import serializers
from product.models import (
    Supplier, Product, Category, ProductCategory, Size, Color, ProductVariant
)
from django.db.models import Sum
from product.utils import convert_image_to_jpeg


class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = [
            'id', 'company_name', 'slug', 'contact_person', 'email',
            'phone_number', 'address', 'tax_id', 'status',
            'website', 'started_at'
        ]
        read_only_fields = ('id','slug')

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
            'parent',
        ]
        read_only_fields = ('id','slug',)

class RecursiveCategorySerializer(serializers.ModelSerializer):
    """
    Serializer cho Category bao gồm các subcategories lồng nhau.
    Sử dụng chính Serializer này một cách đệ quy.
    """
    subcategories = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'image_url',
            'subcategories',
            'parent',
        ]
        read_only_fields = ('id','slug',)

    def get_subcategories(self, obj: Category):
        """
        Lấy và serialize các subcategories trực tiếp của category hiện tại (obj).
        """
        subcategories_queryset = Category.objects.filter(parent=obj).order_by('name')
        serializer = RecursiveCategorySerializer(subcategories_queryset, many=True, context=self.context)
        return serializer.data

CategorySerializer = RecursiveCategorySerializer


class ProductSerializer(serializers.ModelSerializer):
    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        write_only=True
    )
    category_id = serializers.IntegerField(write_only=True, required=False)
    stock = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'supplier',
            'supplier_details',
            'name',
            'slug',
            'description',
            'cost_price',
            'price',
            'sale_price',
            'is_published',
            'publish_at',
            'image_url',
            'category_id',
            'stock',
        ]
        read_only_fields = (
            'slug',
            'supplier_details',
            'effective_price',
            'is_published',
            'stock',
        )
    def validate_image_url(self, value):
        return convert_image_to_jpeg(value)
    def get_stock(self, obj):
        """
        Calculate the total stock by summing up the stock of all related ProductVariant instances.
        """
        return obj.variants.aggregate(total_stock=Sum('stock'))['total_stock'] or 0

class ProductVariantSerializer(serializers.ModelSerializer):
    color_details = ColorSerializer(source='color', read_only=True, allow_null=True)
    size_details = SizeSerializer(source='size', read_only=True, allow_null=True)
    product_details = ProductSerializer(source='product', read_only=True)
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_details',
            'size',
            'size_details',
            'color',
            'color_details',
            'sku',
            'stock',
            'image_url',
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
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ProductVariant.objects.all(),
                fields=('product', 'size', 'color'),
                message="This variant (size/color combination) already exists for this product."
            )
        ]
