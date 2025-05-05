from django.db import models
from django.utils import timezone
# Create your models here.
from product.enums import SupplierStatus
from django.core.exceptions import ObjectDoesNotExist # Import để xử lý lỗi không tìm thấy
from django.utils.text import slugify
class Supplier(models.Model):
    company_name = models.CharField(max_length=255, verbose_name="Company Name", unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True, verbose_name="Slug")
    contact_person = models.CharField(max_length=255, verbose_name="Contact Person")
    email = models.EmailField(max_length=255, verbose_name="Email", unique=True)
    phone_number = models.CharField(max_length=20, verbose_name="Phone Number", unique=True)
    address = models.CharField(max_length=255, verbose_name="Address")
    tax_id = models.CharField(max_length=20, verbose_name="Tax ID")
    status = models.CharField(
        max_length=20,
        choices=SupplierStatus.choices,
        default=SupplierStatus.ACTIVE)
    website = models.URLField(max_length=255, verbose_name="Website")
    started_at = models.DateTimeField(default=timezone.now, verbose_name="Started At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(default=None, blank=True, null=True, verbose_name="Updated At")

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.company_name)
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'supplier'
    
class Product(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255, unique=True, verbose_name="Product Name")
    slug = models.SlugField(max_length=255, unique=True, default="product-name")
    description = models.TextField(blank=True, null=True)
    cost_price = models.IntegerField(default=0, verbose_name="Cost Price")
    price = models.IntegerField(default=0, verbose_name="Cost Price")
    sale_price = models.IntegerField(default=0, verbose_name="Cost Price")
    is_published = models.BooleanField(default=False, verbose_name="Is Published")
    # --- Trường mới cho hẹn giờ ---
    publish_at = models.DateTimeField(
        null=True,          # Cho phép không đặt lịch
        blank=True,         # Cho phép để trống trong form/admin
        default=None,       # Giá trị mặc định là không có lịch
        verbose_name="Scheduled Publish Time",
        help_text="Set a future date/time to publish the product automatically. "
                  "Product will only appear if 'Published Status' is also checked AND this time is reached (or if this field is blank).",
        db_index=True       # Thêm index vì có thể sẽ query theo trường này
    )
    image_url = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Image URL")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(default=None, blank=True, null=True, verbose_name="Updated At")
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'product'
        ordering = ['-created_at'] # Sắp xếp mặc định
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['name']),
            models.Index(fields=['publish_at']), # Thêm index cho trường mới
            models.Index(fields=['is_published']),
        ]

    def delete(self, *args, **kwargs):
        """
        Override phương thức delete để xóa file ảnh liên quan.
        Lưu ý: Việc xóa ProductCategory nên được xử lý qua cascade delete
        của ForeignKey trong model ProductCategory hoặc qua ManyToManyField.
        """
        # Xóa file ảnh nếu tồn tại
        if self.image_url:
            try:
                # Kiểm tra xem image_url có file không trước khi xóa
                if hasattr(self.image_url, 'path') and self.image_url.storage.exists(self.image_url.name):
                     self.image_url.delete(save=False)  # save=False để tránh gọi lại save()
                elif not hasattr(self.image_url, 'path'):
                     # Trường hợp storage không cung cấp path trực tiếp (như S3)
                     self.image_url.delete(save=False)
            except Exception as e:
                # Log lỗi hoặc xử lý phù hợp
                print(f"Error deleting image file for product {self.pk}: {e}")

        super().delete(*args, **kwargs) # Gọi phương thức delete gốc

    def save(self, *args, **kwargs):
        """
        Override phương thức save để tự động tạo slug và xử lý xóa ảnh cũ.
        """
        # 1. Tự động tạo slug từ name nếu slug rỗng
        if not self.slug:
            self.slug = slugify(self.name)

        # 2. Xử lý xóa ảnh cũ nếu ảnh mới được tải lên (logic từ ban đầu)
        if self.pk: # Chỉ thực hiện khi update (đã có pk)
            try:
                old_instance = Product.objects.get(pk=self.pk)
                if old_instance.image_url and self.image_url != old_instance.image_url:
                    # Kiểm tra file cũ tồn tại trước khi xóa
                    if hasattr(old_instance.image_url, 'path') and old_instance.image_url.storage.exists(old_instance.image_url.name):
                         old_instance.image_url.delete(save=False)
                    elif not hasattr(old_instance.image_url, 'path'):
                         old_instance.image_url.delete(save=False)
            except ObjectDoesNotExist:
                pass # Bỏ qua nếu không tìm thấy instance cũ (trường hợp hiếm)
            except Exception as e:
                 # Log lỗi hoặc xử lý phù hợp
                print(f"Error deleting old image file for product {self.pk}: {e}")
        self.updated_at = timezone.now()
        super().save(*args, **kwargs) # Gọi phương thức save gốc

class Category(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="subcategories")
    slug = models.SlugField(max_length=255, unique=True, default="category-name")
    description = models.TextField(blank=True, null=True)
    image_url = models.ImageField(upload_to='categories/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, blank=True, null=True)
    def __str__(self):
        return self.name  # Trả về tên của danh mục

    class Meta:
        db_table = 'category'
    
class ProductCategory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_categories")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        db_table = 'product_category'


class Size(models.Model):
    name = models.CharField(max_length=255, verbose_name="Size Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(default=None, blank=True, null=True, verbose_name="Updated At")

    def __str__(self):
        return self.name  # Trả về tên của kích thước

    class Meta:
        db_table = 'size'

class Color(models.Model):
    name = models.CharField(max_length=255, verbose_name="Color Name")
    hex_code = models.CharField(max_length=7, verbose_name="Hex Code")  # Mã màu HEX
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(default=None, blank=True, null=True, verbose_name="Updated At")

    def __str__(self):
        return self.name  # Trả về tên của màu sắc

    class Meta:
        db_table = 'color'

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    size = models.ForeignKey(Size, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Size")
    color = models.ForeignKey(Color, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Color")
    sku = models.CharField(max_length=255, verbose_name="SKU")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock")
    image_url = models.ImageField(upload_to='product_variants/', blank=True, null=True, verbose_name="Image URL")
    weight_grams = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Weight (grams)")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(default=None, blank=True, null=True, verbose_name="Updated At")
    def __str__(self):
        return f"{self.product.name} - {self.size.name if self.size else 'N/A'} - {self.color.name if self.color else 'N/A'}"

    class Meta:
        db_table = 'product_variant'

