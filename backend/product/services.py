import logging
import re  # Import for hex code validation
from typing import List, Dict, Any, Optional, Union

from django.db import transaction, IntegrityError
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import QuerySet, Q, Model
from decimal import Decimal
from product.enums import SupplierStatus
from product.models import (
    Supplier, Product, Category, ProductCategory, Size, Color, ProductVariant
)

logger = logging.getLogger(__name__)

def _generate_unique_slug(model_class: type[Model], base_name: str, instance_pk: Optional[int] = None) -> str:
    """
    Tạo slug duy nhất cho một model dựa trên base_name.
    Loại trừ instance_pk nếu được cung cấp (dùng khi update).
    """
    if not base_name: # Xử lý trường hợp tên rỗng
        base_name = model_class.__name__.lower()

    slug = slugify(base_name)
    if not slug: # Xử lý trường hợp slugify trả về chuỗi rỗng
        slug = model_class.__name__.lower()

    original_slug = slug
    counter = 1
    queryset = model_class.objects.all()
    if instance_pk:
        queryset = queryset.exclude(pk=instance_pk)

    while queryset.filter(slug=slug).exists():
        slug = f'{original_slug}-{counter}'
        counter += 1
    return slug

def generate_sku(product_name, size_name, color_name):
    """
    Helper function to generate SKU based on product name, size, and color.
    """
    product_slug = slugify(product_name)[:10].upper()  # Limit to 10 characters
    size_slug = slugify(size_name)[:5].upper() if size_name else "NOSIZE"
    color_slug = slugify(color_name)[:5].upper() if color_name else "NOCOLOR"
    return f"{product_slug}-{size_slug}-{color_slug}"
class ProductVariantService:

    @staticmethod
    @transaction.atomic
    def create_product_variant_with_attributes(data: Dict[str, Any]) -> List[ProductVariant]:
        """
        Service to create product variants with attributes.
        - size_names: Comma-separated string of sizes.
        - color_name: Uppercase string for color name.
        - hex_code: String in the format "#RRGGBB".
        - stock: Positive integer for stock.
        - weight_grams: Decimal value for weight in grams.
        """
        # Validate hex code format
        hex_code = data.get('hex_code')
        color_name = data.get('color_name')
        size_names = data.get('size_names')
        stock = data.get('stock')
        weight_grams = data.get('weight_grams')
        image_url = data.get('image_url')
        product = data.get('product')

        if not re.match(r"^#[0-9A-Fa-f]{6}$", hex_code):
            raise ValueError("Invalid hex code format. Must be in the format '#RRGGBB'.")

        # Ensure color exists or create it
        color = None
        if color_name:
            color_name = color_name.upper()
            color, _ = Color.objects.get_or_create(name=color_name, hex_code=hex_code)

        # Process size names
        if not size_names:
            raise ValueError("At least one valid size must be provided.")
        size_names = [name.upper() for name in size_names]
        created_variants = []

        if product:
            product = Product.objects.get(pk=product)  # Ensure product exists
        for size_name in size_names:
            # Ensure size exists or create it
            size, _ = Size.objects.get_or_create(name=size_name)

            # Generate SKU
            sku = generate_sku(product.name, size.name, color.name if color else None)

            # Create the product variant
            variant = ProductVariant.objects.create(
                product=product,
                size=size,
                color=color,
                sku=sku,
                stock=stock,
                weight_grams=weight_grams,
                image_url=image_url,
            )
            created_variants.append(variant)

        return created_variants

# --- Size Services ---

    @staticmethod
    @transaction.atomic
    def get_or_create_size(name: str) -> Size:
        """Tìm hoặc tạo mới Size dựa trên tên (case-insensitive)."""
        if not name:
            raise ValueError("Size name cannot be empty.")
        normalized_name = name.strip().upper()  # Normalize and uppercase
        if not normalized_name:
            raise ValueError("Size name cannot be empty after stripping whitespace.")

        try:
            size, created = Size.objects.get_or_create(
                name__iexact=normalized_name,
                defaults={'name': normalized_name}
            )
            if created:
                logger.info(f"Created new Size: '{normalized_name}' with ID: {size.pk}")
                size.updated_at = timezone.now()
                size.save(update_fields=['updated_at'])
            return size
        except Exception as e:
            logger.error(f"Error in get_or_create_size: {e}", exc_info=True)
            raise RuntimeError("An unexpected error occurred while processing the size.") from e

# --- Color Services ---

    @staticmethod
    @transaction.atomic
    def get_or_create_color(name: str, hex_code: Optional[str] = None) -> Color:
        """Tìm hoặc tạo mới Color dựa trên tên (case-insensitive) và mã hex."""
        if not name:
            raise ValueError("Color name cannot be empty.")
        normalized_name = name.strip().upper()
        if not normalized_name:
            raise ValueError("Color name cannot be empty after stripping whitespace.")

        normalized_hex = None
        if hex_code:
            h = str(hex_code).strip().lstrip('#')
            if len(h) in (3, 6):
                try:
                    int(h, 16)
                    normalized_hex = f"#{h.upper()}"
                except ValueError:
                    logger.warning(f"Invalid hex code format provided: '{hex_code}'. Ignoring.")
            else:
                logger.warning(f"Invalid hex code length provided: '{hex_code}'. Ignoring.")

        try:
            color, created = Color.objects.get_or_create(
                name__iexact=normalized_name,
                defaults={
                    'name': normalized_name,
                    'hex_code': normalized_hex or '#FFFFFF'
                }
            )
            updated_fields = []
            if not created and normalized_hex and color.hex_code != normalized_hex:
                color.hex_code = normalized_hex
                updated_fields.append('hex_code')
                logger.info(f"Updated hex code for Color '{normalized_name}' to {normalized_hex}")

            if created:
                logger.info(f"Created new Color: '{normalized_name}' with ID: {color.pk}")
                updated_fields.append('updated_at')

            if updated_fields or created:
                color.updated_at = timezone.now()
                color.save(update_fields=updated_fields)

            return color
        except Exception as e:
            logger.error(f"Error in get_or_create_color: {e}", exc_info=True)
            raise RuntimeError("An unexpected error occurred while processing the color.") from e

# --- Supplier Services ---

class SupplierService:
    @staticmethod
    @transaction.atomic
    def create_supplier(data: Dict[str, Any]) -> Supplier:
        """Create a new Supplier."""
        try:
            supplier = Supplier.objects.create(**data)
            logger.info(f"Supplier '{supplier.company_name}' created with ID: {supplier.pk}")
            return supplier
        except Exception as e:
            logger.error(f"Error creating supplier: {e}", exc_info=True)
            raise RuntimeError("Could not create supplier.") from e

    @staticmethod
    @transaction.atomic
    def update_supplier(supplier_id: int, data: Dict[str, Any]) -> Supplier:
        """Update an existing Supplier."""
        try:
            supplier = Supplier.objects.get(pk=supplier_id)
            has_changes = False
            for field, value in data.items():
                if hasattr(supplier, field) and getattr(supplier, field) != value:
                    setattr(supplier, field, value)
                    has_changes = True
            if has_changes:
                supplier.save()
                logger.info(f"Supplier {supplier_id} updated.")
            return supplier
        except ObjectDoesNotExist:
            raise ValueError(f"Supplier with ID {supplier_id} not found.")
        except Exception as e:
            logger.error(f"Error updating supplier {supplier_id}: {e}", exc_info=True)
            raise RuntimeError("Could not update supplier.") from e

    @staticmethod
    def get_supplier_by_id(supplier_id: int) -> Optional[Supplier]:
        """Retrieve a Supplier by its ID."""
        try:
            return Supplier.objects.prefetch_related('products').get(pk=supplier_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def list_suppliers(filters: Optional[Dict[str, Any]] = None) -> QuerySet[Supplier]:
        """List Suppliers with optional filters."""
        queryset = Supplier.objects.prefetch_related('products').all()
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            if 'search' in filters:
                queryset = queryset.filter(company_name__icontains=filters['search'])
        return queryset.order_by('company_name')

    @staticmethod
    @transaction.atomic
    def delete_supplier(supplier_id: int) -> bool:
        """Delete a Supplier."""
        try:
            supplier = Supplier.objects.get(pk=supplier_id)
            supplier.delete()
            logger.info(f"Supplier '{supplier.company_name}' deleted.")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"Supplier with ID {supplier_id} not found.")
            return False
        except Exception as e:
            logger.error(f"Error deleting supplier {supplier_id}: {e}", exc_info=True)
            raise RuntimeError("Could not delete supplier.") from e

# --- Category Services ---
class CategoryService:

    @staticmethod
    @transaction.atomic
    def create_category(validated_data: Dict[str, Any]) -> Category:
        """
        Tạo mới Category từ dữ liệu đã được validate bởi serializer.
        Hàm này đảm nhiệm việc tạo slug và lưu category.
        validated_data['parent'] đã là một Category object hoặc None.
        """
        name = validated_data.get('name')
        if not name:
            # Mặc dù serializer đã validate, kiểm tra lại ở service là không thừa
            raise ValueError("Category name is required.")

        # Tạo slug duy nhất
        slug = _generate_unique_slug(Category, name) # Giả sử hàm này tồn tại và đúng
        validated_data['slug'] = slug # Gán slug vào validated_data

        try:
            # Tạo category trực tiếp từ validated_data
            category = Category.objects.create(**validated_data)
            logger.info(f"Category '{category.name}' created with ID: {category.pk}, Slug: {category.slug}")
            return category
        except IntegrityError as e:
            logger.error(f"Integrity error creating category '{name}': {e}. Data: {validated_data}", exc_info=True)
            if 'slug' in str(e).lower():
                raise ValueError(f"Category slug '{slug}' might already exist.")
            raise ValueError(f"Could not create category due to a database constraint: {e}")
        except Exception as e:
            logger.error(f"Error creating category '{name}': {e}. Data: {validated_data}", exc_info=True)
            raise RuntimeError("Could not create category due to an unexpected error.") from e
    @staticmethod
    @transaction.atomic
    def update_category(category_id: int, data: Dict[str, Any]) -> Category:
        """Cập nhật Category."""
        try:
            category = Category.objects.get(pk=category_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Category with ID {category_id} not found.")

        # Cập nhật slug nếu name thay đổi
        new_name = data.get('name')
        if new_name and new_name != category.name:
            data['slug'] = _generate_unique_slug(Category, new_name, category_id)

        # Xử lý parent ID
        parent_id = data.get('parent')
        if 'parent' in data: # Chỉ xử lý nếu key 'parent' được gửi (cho phép gửi null)
            if parent_id:
                if not Category.objects.filter(pk=parent_id).exclude(pk=category_id).exists(): # Không thể là con của chính nó hoặc category không tồn tại
                    raise ValueError(f"Invalid parent category ID {parent_id}.")
                if isinstance(parent_id, Category): data['parent'] = parent_id.pk
                else:
                    try: data['parent'] = int(parent_id)
                    except (ValueError, TypeError): raise ValueError("Invalid parent ID format.")
            else:
                data['parent'] = None # Gán parent là null

        # Cập nhật các trường
        has_changes = False
        for field, value in data.items():
            if hasattr(category, field) and field != 'parent': # Xử lý parent riêng
                if getattr(category, field) != value:
                    setattr(category, field, value)
                    has_changes = True
        # Cập nhật parent nếu có
        if 'parent' in data:
            parent_instance = None
            if data['parent']:
                parent_instance = Category.objects.get(pk=data['parent'])
            if category.parent != parent_instance:
                category.parent = parent_instance
                has_changes = True


        if has_changes:
            category.updated_at = timezone.now()
            try:
                category.save()
                logger.info(f"Category {category_id} updated.")
            except Exception as e:
                logger.error(f"Error updating category {category_id}: {e}", exc_info=True)
                raise RuntimeError(f"Could not update category {category_id}.") from e
        else:
            logger.info(f"No changes detected for Category {category_id}.")


        return category

    @staticmethod
    @transaction.atomic
    def get_category_by_id(category_id: int) -> Optional[Category]:
        """Lấy Category theo ID."""
        try:
            return Category.objects.select_related('parent').prefetch_related('subcategories').get(pk=category_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def list_categories(filters: Optional[Dict[str, Any]] = None) -> QuerySet[Category]:
        """Liệt kê Categories với bộ lọc."""
        queryset = Category.objects.select_related('parent').prefetch_related('subcategories').all()
        if filters:
            parent_id = filters.get('parent_id')
            search = filters.get('search')
            product_id = filters.get('product_id')

            if parent_id == 'null' or parent_id == 0:  # Lấy category gốc
                queryset = queryset.filter(parent__isnull=True)
            elif parent_id:
                try:
                    queryset = queryset.filter(parent_id=int(parent_id))
                except (ValueError, TypeError):
                    logger.warning(f"Invalid parent_id filter: {parent_id}")

            if search:
                queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))

            if product_id:
                try:
                    product_id = int(product_id)
                    queryset = queryset.filter(productcategory__product_id=product_id).distinct()
                except (ValueError, TypeError):
                    logger.warning(f"Invalid product_id filter: {product_id}")
        else:
            queryset = queryset.filter(parent__isnull=True)

        return queryset.order_by('name')

    @staticmethod
    @transaction.atomic
    def delete_category(category_id: int) -> bool:
        """Xóa Category."""
        try:
            category = Category.objects.get(pk=category_id)
            category_name = category.name
            category.delete()
            logger.info(f"Category '{category_name}' (ID: {category_id}) deleted.")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"Attempted to delete non-existent Category with ID: {category_id}")
            return False
        except Exception as e:
            logger.error(f"Error deleting category {category_id}: {e}", exc_info=True)
            raise RuntimeError(f"Could not delete category {category_id}.") from e

    # --- ProductCategory Services ---
    @staticmethod
    @transaction.atomic
    def _get_all_category_ids_from_nested_dict(nested_data: Dict, current_list: Optional[List[int]] = None) -> List[int]:
        """Helper: Lấy ID category từ dict lồng nhau."""
        if current_list is None: current_list = []
        if not isinstance(nested_data, dict): return current_list

        for cat_id_str, cat_info in nested_data.items():
            try:
                cat_id = int(cat_id_str)
                if cat_id not in current_list and Category.objects.filter(pk=cat_id).exists():
                    current_list.append(cat_id)
                if isinstance(cat_info, dict) and 'sub' in cat_info and isinstance(cat_info['sub'], dict):
                    CategoryService._get_all_category_ids_from_nested_dict(cat_info['sub'], current_list)
            except (ValueError, TypeError): continue
        return current_list

    @staticmethod
    @transaction.atomic
    def assign_product_categories(product: Product, category_ids: List[int], replace: bool = True):
        """
        Gán danh mục cho sản phẩm.
        Nếu replace=True, xóa các liên kết cũ trước khi thêm mới.
        """
        if replace:
            existing_links = ProductCategory.objects.filter(product=product)
            if existing_links.exists():
                count = existing_links.count()
                existing_links.delete()
                logger.info(f"Deleted {count} existing category assignments for Product ID {product.pk}.")

        valid_categories = Category.objects.filter(pk__in=category_ids)
        valid_category_ids = set(cat.id for cat in valid_categories)
        invalid_ids = set(category_ids) - valid_category_ids

        if invalid_ids:
            logger.warning(f"Product ID {product.pk}: Skipped invalid category IDs: {invalid_ids}")

        if not valid_categories.exists():
            logger.info(f"Product ID {product.pk}: No valid categories to assign.")
            return

        categories_to_assign = []
        for category in valid_categories:
            if not replace and ProductCategory.objects.filter(product=product, category=category).exists():
                continue
            categories_to_assign.append(ProductCategory(product=product, category=category))

        if categories_to_assign:
            try:
                ProductCategory.objects.bulk_create(categories_to_assign, ignore_conflicts=True)
                logger.info(f"Assigned {len(categories_to_assign)} categories to Product ID {product.pk}.")
            except Exception as e:
                logger.error(f"Error bulk creating ProductCategory for Product ID {product.pk}: {e}", exc_info=True)
                raise RuntimeError("Could not assign categories to product.") from e

# --- Product Services ---

class ProductService:
    @staticmethod
    def update_product_with_nested_categories(product_id: int, data: Dict[str, Any], nested_categories: Optional[Dict] = None) -> Product:
        """
        Update a product and its categories.
        """
        try:
            product = Product.objects.get(pk=product_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Product with ID {product_id} not found.")

        updatable_fields = ['name', 'description', 'cost_price', 'price', 'sale_price', 'is_published', 'image_url']
        has_changes = False

        for field in updatable_fields:
            if field in data and getattr(product, field) != data[field]:
                setattr(product, field, data[field])
                has_changes = True

        if has_changes:
            product.updated_at = timezone.now()
            product.save()

        if nested_categories is not None:
            category_ids = ProductService._get_all_category_ids_from_nested_dict(nested_categories)
            ProductService.assign_product_categories(product, category_ids, replace=True)

        return product

    @staticmethod
    def _get_all_category_ids_from_nested_dict(nested_data: Dict, current_list: Optional[list] = None) -> list:
        """Helper: Extract category IDs from a nested dictionary."""
        if current_list is None:
            current_list = []
        for cat_id, cat_info in nested_data.items():
            try:
                cat_id = int(cat_id)
                if cat_id not in current_list:
                    current_list.append(cat_id)
                if isinstance(cat_info, dict) and 'sub' in cat_info:
                    ProductService._get_all_category_ids_from_nested_dict(cat_info['sub'], current_list)
            except (ValueError, TypeError):
                continue
        return current_list

    @staticmethod
    @transaction.atomic
    def assign_product_categories(product: Product, category_ids: list, replace: bool = True):
        """
        Assign categories to a product.
        If replace=True, remove existing links before adding new ones.
        """
        if replace:
            ProductCategory.objects.filter(product=product).delete()

        valid_categories = Category.objects.filter(pk__in=category_ids)
        ProductCategory.objects.bulk_create(
            [ProductCategory(product=product, category=category) for category in valid_categories],
            ignore_conflicts=True
        )

    @staticmethod
    def get_product_by_id(product_id: int) -> Optional[Product]:
        """Retrieve a product by its ID."""
        try:
            return Product.objects.get(pk=product_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def list_products(filters: Optional[Dict[str, Any]] = None, limit: Optional[int] = None) -> QuerySet[Product]:
        """List products with optional filters."""
        queryset = Product.objects.all()
        if filters:
            if 'is_published' in filters:
                queryset = queryset.filter(is_published=filters['is_published'])
            else:
                queryset = queryset.filter(is_published=True)
            if 'category_id' in filters:
                queryset = queryset.filter(product_categories__category_id=filters['category_id']).distinct()
            if 'search' in filters:
                queryset = queryset.filter(name__icontains=filters['search'])
        # Remove slicing here; it will be applied in the view
        return queryset

    @staticmethod
    @transaction.atomic
    def create_product(data: Dict[str, Any]) -> Product:
        """Tạo Product và gán categories từ category_id trong data."""
        category_id = data.pop('category_id')

        slug = _generate_unique_slug(Product, data.get('name', ''))
        data['slug'] = slug
        try:
            product = Product.objects.create(**data)
            logger.info(f"Product '{product.name}' created with ID: {product.pk}")
        except IntegrityError as e:
            logger.warning(f"Failed to create product. Data: {data}. Error: {e}")
            if 'name' in str(e):
                raise ValueError(f"Product with name '{data.get('name')}' already exists.")
            raise ValueError(f"Could not create product. Error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error creating product: {e}. Data: {data}", exc_info=True)
            raise RuntimeError("An unexpected error occurred while creating the product.") from e

        if category_id:
            try:
                category = Category.objects.get(pk=category_id)
                category_ids = [category.id]
                if category.parent:
                    category_ids.append(category.parent.id)
                CategoryService.assign_product_categories(product, category_ids, replace=True)
            except Category.DoesNotExist:
                raise ValueError(f"Category with ID {category_id} not found.")
        else:
            logger.warning(f"No category_id provided for Product ID {product.pk}.")

        return product

    @staticmethod
    @transaction.atomic
    def delete_product(product_id: int) -> bool:
        """Xóa Product."""
        try:
            product = Product.objects.get(pk=product_id)
            product_name = product.name
            product.delete()
            logger.info(f"Product '{product_name}' (ID: {product_id}) deleted.")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"Attempted to delete non-existent Product with ID: {product_id}")
            return False
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}", exc_info=True)
            raise RuntimeError(f"Could not delete product {product_id}.") from e

    @staticmethod
    @transaction.atomic
    def get_product_by_slug(slug: str) -> Optional[Product]:
        """Retrieve a product by its slug."""
        try:
            return Product.objects.get(slug=slug)
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error retrieving product by slug '{slug}': {e}", exc_info=True)
            raise RuntimeError(f"Could not retrieve product with slug '{slug}'.") from e
# --- Product Variant Services ---

class ProductVariantService:
    @staticmethod
    @transaction.atomic
    def create_variant(data: Dict[str, Any]) -> ProductVariant:
        """Create a ProductVariant."""
        try:
            size = data.get('size')
            color = data.get('color')
            product = data.get('product')

            if size and isinstance(size, str):
                size = Size.objects.get_or_create(name=size.upper())[0]
            if color and isinstance(color, str):
                color = Color.objects.get_or_create(name=color.upper())[0]

            variant = ProductVariant.objects.create(
                product=product,
                size=size,
                color=color,
                sku=data['sku'],
                stock=data['stock'],
                image_url=data.get('image_url'),
                weight_grams=data.get('weight_grams', 0),
                is_active=data.get('is_active', True),
            )
            logger.info(f"Created ProductVariant with SKU: {variant.sku}")
            return variant
        except Exception as e:
            logger.error(f"Error creating product variant: {e}", exc_info=True)
            raise RuntimeError("Could not create product variant.") from e

    @staticmethod
    @transaction.atomic
    def update_variant(variant_id: int, data: Dict[str, Any]) -> ProductVariant:
        """Update a ProductVariant."""
        try:
            variant = ProductVariant.objects.get(pk=variant_id)
            has_changes = False
            for field, value in data.items():
                if hasattr(variant, field) and getattr(variant, field) != value:
                    setattr(variant, field, value)
                    has_changes = True
            if has_changes:
                variant.save()
                logger.info(f"Updated ProductVariant with ID: {variant_id}")
            return variant
        except ObjectDoesNotExist:
            raise ValueError(f"ProductVariant with ID {variant_id} not found.")
        except Exception as e:
            logger.error(f"Error updating product variant {variant_id}: {e}", exc_info=True)
            raise RuntimeError("Could not update product variant.") from e

    @staticmethod
    def get_variant_by_id(variant_id: int) -> Optional[ProductVariant]:
        """Retrieve a ProductVariant by its ID."""
        try:
            return ProductVariant.objects.select_related('product', 'size', 'color').get(pk=variant_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def list_variants(filters: Optional[Dict[str, Any]] = None) -> QuerySet[ProductVariant]:
        """List ProductVariants with optional filters."""
        queryset = ProductVariant.objects.select_related('product', 'size', 'color').all()
        if filters:
            if 'product_id' in filters:
                queryset = queryset.filter(product_id=filters['product_id'])
            if 'is_active' in filters:
                queryset = queryset.filter(is_active=filters['is_active'])
        return queryset.order_by('product__name', 'size__name', 'color__name')

    @staticmethod
    @transaction.atomic
    def delete_variant(variant_id: int) -> bool:
        """Delete a ProductVariant."""
        try:
            variant = ProductVariant.objects.get(pk=variant_id)
            variant.delete()
            logger.info(f"Deleted ProductVariant with ID: {variant_id}")
            return True
        except ObjectDoesNotExist:
            logger.warning(f"ProductVariant with ID {variant_id} not found.")
            return False
        except Exception as e:
            logger.error(f"Error deleting product variant {variant_id}: {e}", exc_info=True)
            raise RuntimeError("Could not delete product variant.") from e

    @staticmethod
    @transaction.atomic
    def list_variants_for_product(product_id: int) -> QuerySet[ProductVariant]:
        """List all variants for a specific product."""
        try:
            product = Product.objects.get(pk=product_id)
            return product.variants.select_related('size', 'color').all()
        except ObjectDoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error retrieving variants for product {product_id}: {e}", exc_info=True)
            raise RuntimeError(f"Could not retrieve variants for product {product_id}.") from e

    @staticmethod
    @transaction.atomic
    def create_product_variant_with_attributes(data: Dict[str, Any]) -> List[ProductVariant]:
        """
        Service to create product variants with attributes.
        - size_names: Comma-separated string of sizes.
        - color_name: Uppercase string for color name.
        - hex_code: String in the format "#RRGGBB".
        - stock: Positive integer for stock.
        - weight_grams: Decimal value for weight in grams.
        """
        # Validate hex code format
        hex_code = data.get('hex_code')
        color_name = data.get('color_name')
        size_names = data.get('size_names')
        stock = data.get('stock')
        weight_grams = data.get('weight_grams')
        image_url = data.get('image_url')
        product = data.get('product')

        if not re.match(r"^#[0-9A-Fa-f]{6}$", hex_code):
            raise ValueError("Invalid hex code format. Must be in the format '#RRGGBB'.")

        # Ensure color exists or create it
        color = None
        if color_name:
            color_name = color_name.upper()
            color, _ = Color.objects.get_or_create(name=color_name, hex_code=hex_code)

        # Process size names
        if not size_names:
            raise ValueError("At least one valid size must be provided.")
        size_names = [name.upper() for name in size_names]
        created_variants = []

        if product:
            product = Product.objects.get(pk=product)  # Ensure product exists
        for size_name in size_names:
            # Ensure size exists or create it
            size, _ = Size.objects.get_or_create(name=size_name)

            # Generate SKU
            sku = generate_sku(product.name, size.name, color.name if color else None)

            # Create the product variant
            variant = ProductVariant.objects.create(
                product=product,
                size=size,
                color=color,
                sku=sku,
                stock=stock,
                weight_grams=weight_grams,
                image_url=image_url,
            )
            created_variants.append(variant)

        return created_variants

    @staticmethod
    @transaction.atomic
    def update_product_variant_with_attributes(variant_id: int, data: Dict[str, Any]) -> ProductVariant:
        """Update a ProductVariant with attributes."""
        try:
            variant = ProductVariant.objects.get(pk=variant_id)
            has_changes = False
            for field, value in data.items():
                if hasattr(variant, field) and getattr(variant, field) != value:
                    setattr(variant, field, value)
                    has_changes = True
            if has_changes:
                variant.save()
                logger.info(f"Updated ProductVariant with ID: {variant_id}")
            return variant
        except ObjectDoesNotExist:
            raise ValueError(f"ProductVariant with ID {variant_id} not found.")
        except Exception as e:
            logger.error(f"Error updating product variant {variant_id}: {e}", exc_info=True)
            raise RuntimeError("Could not update product variant.") from e

    @staticmethod
    @transaction.atomic
    def get_variants_by_product_slug(slug: str):
        """Retrieve all variants of a product by its slug."""
        try:
            product = Product.objects.get(slug=slug)
            return product.variants.select_related('size', 'color').all()
        except ObjectDoesNotExist:
            return None