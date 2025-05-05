import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers # Import parsers
from django.http import Http404
from django.db import IntegrityError
from django.core.exceptions import ValidationError

# Imports cho Swagger
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from typing import Optional
from product.services import ProductService, SupplierService, ProductVariantService, CategoryService
from product.models import Product, ProductVariant, Category
from product.serializers import (
    SupplierSerializer, ProductSerializer, CategorySerializer, ProductVariantSerializer, BaseCategorySerializer
)

from rest_framework import permissions
from rest_framework.generics import ListAPIView

logger = logging.getLogger(__name__)

# --- Helper Function ---
def _parse_query_param_bool(param_value: Optional[str], default: Optional[bool] = None) -> Optional[bool]:
    """Chuyển đổi chuỗi thành giá trị boolean hoặc trả về giá trị mặc định."""
    if param_value is None:
        return default
    param_value = param_value.lower()
    if param_value in ['true', '1', 'yes', 'y']:
        return True
    elif param_value in ['false', '0', 'no', 'n']:
        return False
    else:
        raise ValueError(f"Invalid boolean value: {param_value}")

# --- Supplier API Views ---

class SupplierListCreateAPIView(APIView):
    """
    Liệt kê tất cả nhà cung cấp hoặc tạo mới.
    Cho phép lọc theo 'status' và tìm kiếm 'search'.
    """

    permission_classes = [permissions.IsAdminUser]  # Chỉ cho phép admin truy cập
    @swagger_auto_schema(
        operation_summary="List Suppliers",
        operation_description="Retrieves a list of suppliers, optionally filtered by status or search term.",
        manual_parameters=[
            openapi.Parameter('status', openapi.IN_QUERY, description="Filter by supplier status (e.g., ACTIVE, INACTIVE)", type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('search', openapi.IN_QUERY, description="Search term for company name, contact person, or email", type=openapi.TYPE_STRING, required=False),
        ],
        responses={
            200: openapi.Response('OK', SupplierSerializer(many=True)),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def get(self, request, format=None):
        try:
            filters = {
                'status': request.query_params.get('status'),
                'search': request.query_params.get('search')
            }
            filters = {k: v for k, v in filters.items() if v is not None}
            suppliers = SupplierService.list_suppliers(filters=filters)
            serializer = SupplierSerializer(suppliers, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing suppliers: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Create Supplier",
        operation_description="Creates a new supplier record.",
        request_body=SupplierSerializer, # Sử dụng serializer làm schema cho request body
        responses={
            201: openapi.Response('Created', SupplierSerializer),
            400: openapi.Response('Bad Request - Validation error or duplicate name'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def post(self, request, format=None):
        serializer = SupplierSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                supplier = SupplierService.create_supplier(serializer.validated_data)
                response_serializer = SupplierSerializer(supplier, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, IntegrityError, ValidationError) as e:
                logger.warning(f"Failed to create supplier: {e}. Data: {request.data}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error creating supplier: {e}. Data: {request.data}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SupplierDetailAPIView(APIView):
    """
    Xem, cập nhật (PUT/PATCH), hoặc xóa một nhà cung cấp.
    """

    permission_classes = [permissions.IsAdminUser]  # Chỉ cho phép admin truy cập
    def _get_object(self, pk):
        supplier = SupplierService.get_supplier_by_id(pk)
        if not supplier:
            raise Http404("Supplier not found.")
        return supplier

    @swagger_auto_schema(
        operation_summary="Retrieve Supplier",
        operation_description="Retrieves the details of a specific supplier by its ID.",
        responses={
            200: openapi.Response('OK', SupplierSerializer),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def get(self, request, pk, format=None):
        try:
            supplier = self._get_object(pk)
            serializer = SupplierSerializer(supplier, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving supplier {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Supplier (Full)",
        operation_description="Updates all fields of an existing supplier. Requires all non-read-only fields.",
        request_body=SupplierSerializer,
        responses={
            200: openapi.Response('OK', SupplierSerializer),
            400: openapi.Response('Bad Request - Validation error or duplicate name'),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def put(self, request, pk, format=None):
        try:
            supplier = self._get_object(pk)
            serializer = SupplierSerializer(supplier, data=request.data, partial=False, context={'request': request})
            if serializer.is_valid():
                try:
                    updated_supplier = SupplierService.update_supplier(pk, serializer.validated_data)
                    response_serializer = SupplierSerializer(updated_supplier, context={'request': request})
                    return Response(response_serializer.data)
                except (ValueError, IntegrityError, ValidationError) as e:
                    logger.warning(f"Failed to update supplier {pk}: {e}. Data: {request.data}")
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                     logger.error(f"Unexpected error updating supplier {pk}: {e}. Data: {request.data}", exc_info=True)
                     return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error processing PUT for supplier {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Partial Update Supplier",
        operation_description="Partially updates an existing supplier. Only include the fields to be changed.",
        request_body=SupplierSerializer,
        responses={
            200: openapi.Response('OK', SupplierSerializer),
            400: openapi.Response('Bad Request - Validation error or duplicate name'),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def patch(self, request, pk, format=None):
        try:
            supplier = self._get_object(pk)
            serializer = SupplierSerializer(supplier, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                try:
                    updated_supplier = SupplierService.update_supplier(pk, serializer.validated_data)
                    response_serializer = SupplierSerializer(updated_supplier, context={'request': request})
                    return Response(response_serializer.data)
                except (ValueError, IntegrityError, ValidationError) as e:
                    logger.warning(f"Failed to partial update supplier {pk}: {e}. Data: {request.data}")
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                     logger.error(f"Unexpected error patching supplier {pk}: {e}. Data: {request.data}", exc_info=True)
                     return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error processing PATCH for supplier {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Delete Supplier",
        operation_description="Deletes a specific supplier by its ID. Associated products might be deleted based on `on_delete` policy.",
        responses={
            204: openapi.Response('No Content'),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Suppliers']
    )
    def delete(self, request, pk, format=None):
        try:
            success = SupplierService.delete_supplier(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Supplier not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting supplier {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Category API Views ---

class CategoryListCreateAPIView(APIView):
    """
    Liệt kê danh mục (có thể lọc theo parent_id='null'/'0' hoặc ID) hoặc tạo mới.
    """
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)
    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc POST).
        """
        if self.request.method == 'GET':
            # Cho phép bất kỳ ai truy cập phương thức GET (List)
            permission_classes = [permissions.AllowAny]
        else:
            # Yêu cầu là Admin (is_staff=True) cho các phương thức khác (POST)
            permission_classes = [permissions.IsAdminUser] # Sử dụng quyền IsAdminUser của DRF
            # Hoặc dùng custom permission:
            # from .permissions import IsAdminUser # Nếu bạn tạo file permissions.py
            # permission_classes = [IsAdminUser]

        # Trả về một list các instance của các lớp permission
        return [permission() for permission in permission_classes]

    @swagger_auto_schema(
        operation_summary="List Categories",
        operation_description="Retrieves a list of categories, optionally filtered by parent ID, search term, or product ID. Use parent='null' or parent='0' to get top-level categories. Returns a nested structure.",
        manual_parameters=[
            openapi.Parameter('parent', openapi.IN_QUERY, description="Filter by parent category ID ('null' or '0' for top-level)", type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('search', openapi.IN_QUERY, description="Search term for category name or description", type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('product_id', openapi.IN_QUERY, description="Filter by product ID to get associated categories", type=openapi.TYPE_INTEGER, required=False),
        ],
        responses={
            200: CategorySerializer(many=True),  # Nhớ rằng CategorySerializer là Recursive
            500: "Internal server error",
        },
        tags=['Categories']
    )
    def get(self, request, format=None):
        try:
            filters = {
                'parent_id': request.query_params.get('parent'),
                'search': request.query_params.get('search'),
                'product_id': request.query_params.get('product_id'),
            }
            filters = {k: v for k, v in filters.items() if v is not None}
            categories = CategoryService.list_categories(filters=filters)
            if request.query_params.get('product_id'):
                serializer =  BaseCategorySerializer(categories, many=True, context={'request': request})
                return Response(serializer.data)
            # Serialize categories using CategorySerializer
            serializer = CategorySerializer(categories, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing categories: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Create Category",
        types=['multipart/form-data', 'application/json'],
        operation_description="Creates a new category. Provide 'parent' (ID) for subcategories.",
        request_body=openapi.Schema( # Định nghĩa request body thủ công hơn vì serializer có parent read_only
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='Category name'),
                'parent': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the parent category (optional)', nullable=True),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='Category description (optional)', nullable=True),
                # image url file upload
                'image_url': openapi.Schema(type=openapi.TYPE_FILE, description='Image file (optional)', format=openapi.FORMAT_BINARY, nullable=True),
        }
        ),
        responses={
            201: CategorySerializer,
            400: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Categories']
    )
    def post(self, request, format=None):
        serializer = CategorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                category_data = serializer.validated_data.copy()
                category = CategoryService.create_category(category_data)
                response_serializer = CategorySerializer(category, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, IntegrityError, ValidationError) as e:
                logger.warning(f"Failed to create category: {e}. Data: {request.data}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error creating category: {e}. Data: {request.data}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailAPIView(APIView):
    """
    Xem, cập nhật (PUT/PATCH), hoặc xóa một danh mục.
    """

    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc PUT/PATCH/DELETE).
        """
        if self.request.method == 'GET':
            # Cho phép bất kỳ ai truy cập phương thức GET (List)
            permission_classes = [permissions.AllowAny]
        else:
            # Yêu cầu là Admin (is_staff=True) cho các phương thức khác (PUT/PATCH/DELETE)
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]

    def _get_object(self, pk):
        category = CategoryService.get_category_by_id(pk)
        if category is None:
            raise Http404("Category not found.")
        return category

    @swagger_auto_schema(
        operation_summary="Retrieve Category",
        operation_description="Retrieves the details of a specific category (with nested subcategories).",
        responses={
            200: CategorySerializer,
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Categories']
    )
    def get(self, request, pk, format=None):
        try:
            category = self._get_object(pk)
            serializer = CategorySerializer(category, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving category {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Category (Full)",
        operation_description="Updates an existing category. Requires all non-read-only fields. Provide 'parent' (ID) or null.",
        request_body=openapi.Schema( # Định nghĩa lại request body cho rõ ràng
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'parent': openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
                'description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY, description='New image file (optional)'),
            }
        ),
        responses={
            200: CategorySerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Categories']
    )
    def put(self, request, pk, format=None):
        try:
            category = self._get_object(pk)
            serializer = CategorySerializer(category, data=request.data, partial=False, context={'request': request})
            if serializer.is_valid():
                 try:
                    category_data = serializer.validated_data.copy()
                    parent_obj = category_data.pop('parent', Ellipsis)
                    if parent_obj is not Ellipsis:
                         category_data['parent'] = parent_obj.id if parent_obj else None

                    updated_category = CategoryService.update_category(pk, category_data)
                    response_serializer = CategorySerializer(updated_category, context={'request': request})
                    return Response(response_serializer.data)
                 except (ValueError, IntegrityError, ValidationError) as e:
                    logger.warning(f"Failed to update category {pk}: {e}. Data: {request.data}")
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                 except Exception as e:
                     logger.error(f"Unexpected error updating category {pk}: {e}. Data: {request.data}", exc_info=True)
                     return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error processing PUT for category {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Partial Update Category",
        operation_description="Partially updates an existing category. Only include fields to change. Provide 'parent' (ID) or null.",
        request_body=openapi.Schema( # Định nghĩa lại request body
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'parent': openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
                'description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY),
            }
        ),
        responses={
            200: CategorySerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Categories']
    )
    def patch(self, request, pk, format=None):
        try:
            category = self._get_object(pk)
            serializer = CategorySerializer(category, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                try:
                    category_data = serializer.validated_data.copy()
                    parent_obj = category_data.pop('parent', Ellipsis)
                    if parent_obj is not Ellipsis:
                        category_data['parent'] = parent_obj.id if parent_obj else None

                    updated_category = CategoryService.update_category(pk, category_data)
                    response_serializer = CategorySerializer(updated_category, context={'request': request})
                    return Response(response_serializer.data)
                except (ValueError, IntegrityError, ValidationError) as e:
                    logger.warning(f"Failed to partial update category {pk}: {e}. Data: {request.data}")
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                     logger.error(f"Unexpected error patching category {pk}: {e}. Data: {request.data}", exc_info=True)
                     return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error processing PATCH for category {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Delete Category",
        operation_description="Deletes a specific category. Subcategories might have their parent set to null based on `on_delete` policy.",
        responses={
            204: 'No Content',
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Categories']
    )
    def delete(self, request, pk, format=None):
        try:
            success = CategoryService.delete_category(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                 return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting category {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Product API Views ---

class ProductListCreateAPIView(APIView):
    """
    Liệt kê sản phẩm hoặc tạo mới.
    """

    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc POST).
        """
        if self.request.method == 'GET':
            # Cho phép bất kỳ ai truy cập phương thức GET (List)
            permission_classes = [permissions.AllowAny]
        else:
            # Yêu cầu là Admin (is_staff=True) cho các phương thức khác (POST)
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]
    @swagger_auto_schema(
        operation_summary="List Products",
        operation_description="Retrieves a list of products with filtering options.",
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_QUERY, description="Filter by Category ID", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('supplier', openapi.IN_QUERY, description="Filter by Supplier ID", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('published', openapi.IN_QUERY, description="Filter by published status ('true' or 'false')", type=openapi.TYPE_BOOLEAN, required=False),
            openapi.Parameter('min_price', openapi.IN_QUERY, description="Filter by minimum price", type=openapi.TYPE_NUMBER, required=False),
            openapi.Parameter('max_price', openapi.IN_QUERY, description="Filter by maximum price", type=openapi.TYPE_NUMBER, required=False),
            openapi.Parameter('search', openapi.IN_QUERY, description="Search term for product name, description, or variant SKU", type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('limit', openapi.IN_QUERY, description="Limit the number of products returned", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('latest', openapi.IN_QUERY, description="Sort by publish_at if true (only published products)", type=openapi.TYPE_BOOLEAN, required=False),
        ],
        responses={200: ProductSerializer(many=True), 500: "Internal server error"},
        tags=['Products']
    )
    def get(self, request, format=None):
        try:
            filters = {
                'category_id': request.query_params.get('category'),
                'supplier_id': request.query_params.get('supplier'),
                'is_published': _parse_query_param_bool(request.query_params.get('published'), default=True),
                'min_price': request.query_params.get('min_price'),
                'max_price': request.query_params.get('max_price'),
                'search': request.query_params.get('search'),
            }
            filters = {k: v for k, v in filters.items() if v is not None}

            limit = request.query_params.get('limit', None)
            if limit is not None:
                try:
                    limit = int(limit)  # Chuyển đổi sang số nguyên
                except ValueError:
                    return Response({"error": "Invalid limit value. Must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

            products = ProductService.list_products(filters=filters)
            # Apply 'latest' sorting if specified
            latest = _parse_query_param_bool(request.query_params.get('latest'), default=False)
            if latest:
                products = products.order_by('-publish_at')

            # Apply slicing (limit) after filtering and ordering
            if limit is not None:
                products = products[:limit]

            serializer = ProductSerializer(products, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing products: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Create Product",
        operation_description="""Creates a new product.
        Requires 'supplier' (ID) and 'name'.
        Optionally include 'categories_hierarchy' as a nested dictionary to assign categories.
        Example for categories_hierarchy: `{"1": {"sub": {"2": {}, "3": {}}}}` (assigns product to categories 1, 2, 3 assuming they exist).
        """,
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['supplier', 'name', 'price'], # Giá bán thường là bắt buộc
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the supplier'),
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='Product name (must be unique)'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                'cost_price': openapi.Schema(type=openapi.TYPE_INTEGER, default=0), # Hoặc TYPE_NUMBER nếu là Decimal
                'price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY, description='Product image upload'),
                'category_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the category (optional)'),
                # publish_at field
                'publish_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, description='Publish date and time (optional)'),
            }
        ),
        responses={
            201: ProductSerializer,
            400: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Products']
    )
    def post(self, request, format=None):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            try:
                product = ProductService.create_product(
                    serializer.validated_data,
                )
                response_serializer = ProductSerializer(product)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except (ValueError, IntegrityError, ValidationError) as e:
                logger.warning(f"Failed to create product: {e}. Data: {request.data}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error creating product: {e}. Data: {request.data}", exc_info=True)
                return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("serializer: ", serializer.data)
        print("serializer errors: ", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    """
    Xem, cập nhật (PUT/PATCH), hoặc xóa một sản phẩm.
    """

    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc PUT/PATCH/DELETE).
        """
        if self.request.method == 'GET':
            # Cho phép bất kỳ ai truy cập phương thức GET (List)
            permission_classes = [permissions.AllowAny]
        else:
            # Yêu cầu là Admin (is_staff=True) cho các phương thức khác (PUT/PATCH/DELETE)
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]
    def _get_object(self, pk):
        product = ProductService.get_product_by_id(pk)
        if product is None:
            raise Http404("Product not found.")
        return product

    @swagger_auto_schema(
        operation_summary="Retrieve Product",
        operation_description="Retrieves the details of a specific product.",
        responses={
            200: ProductSerializer,
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Products']
    )
    def get(self, request, pk, format=None):
        try:
            product = self._get_object(pk)
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving product {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @swagger_auto_schema(
        operation_summary="Update Product (Full)",
        operation_description="""Updates an existing product. Requires all non-read-only fields (except categories_hierarchy).
        Optionally include 'categories_hierarchy' to overwrite category assignments.""",
        request_body=openapi.Schema( # Định nghĩa schema cho PUT
            type=openapi.TYPE_OBJECT,
            required=['supplier', 'name', 'price'], # Các trường bắt buộc khi update (có thể tùy chỉnh)
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the supplier'),
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                'cost_price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'sale_price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'is_published': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY),
                'categories_hierarchy': openapi.Schema(type=openapi.TYPE_OBJECT, nullable=True, example={"1": {"sub": {"4": {}}}}),
            }
        ),
        responses={
            200: ProductSerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Products']
    )
    def put(self, request, pk, format=None):
        return self._handle_update(request, pk, partial=False)

    @swagger_auto_schema(
        operation_summary="Partial Update Product",
        operation_description="""Partially updates an existing product. Only include fields to change.
        Optionally include 'categories_hierarchy' to overwrite category assignments.""",
        request_body=openapi.Schema( # Định nghĩa schema cho PATCH (các trường đều optional)
            type=openapi.TYPE_OBJECT,
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER),
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'description': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                'cost_price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'sale_price': openapi.Schema(type=openapi.TYPE_INTEGER), # Hoặc TYPE_NUMBER
                'is_published': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY),
                'categories_hierarchy': openapi.Schema(type=openapi.TYPE_OBJECT, nullable=True, example={"5": {}}),
            }
        ),
        responses={
            200: ProductSerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Products']
    )
    def patch(self, request, pk, format=None):
        print("request data: ", request.data)
        return self._handle_update(request, pk, partial=True)

    # --- Logic chung cho PUT/PATCH ---
    def _handle_update(self, request, pk, partial):
        try:
            product = ProductService.get_product_by_id(pk)
            if not product:
                raise Http404("Product not found.")

            request_data = request.data.copy()
            nested_categories = request_data.pop('categories_hierarchy', None)

            serializer = ProductSerializer(product, data=request_data, partial=partial, context={'request': request})
            if serializer.is_valid():
                try:
                    updated_product = ProductService.update_product_with_nested_categories(
                        pk, serializer.validated_data, nested_categories=nested_categories
                    )
                    response_serializer = ProductSerializer(updated_product, context={'request': request})
                    return Response(response_serializer.data)
                except ValueError as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error processing update for product {pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Delete Product",
        operation_description="Deletes a specific product and potentially its variants and category links.",
        responses={204: 'No Content', 404: "Internal server erroe", 500: "Internal server erroe"},
        tags=['Products']
    )
    def delete(self, request, pk, format=None):
        try:
            success = ProductService.delete_product(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                 return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting product {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductDetailBySlugAPIView(APIView):
    """
    Retrieve product details by slug.
    """

    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Retrieve Product by Slug",
        operation_description="Retrieves the details of a specific product by its slug, including its variants.",
        responses={
            200: openapi.Response('OK', ProductSerializer),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Products']
    )
    def get(self, request, slug, format=None):
        try:
            product = ProductService.get_product_by_slug(slug)
            if not product:
                return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving product by slug '{slug}': {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Product Variant API Views ---

# Schema chung cho request body tạo/cập nhật variant
variant_request_schema_properties = {
    'product': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the parent product (Required for POST if not using nested URL)'),
    'size': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the size (Optional)', nullable=True),
    'size_name': openapi.Schema(type=openapi.TYPE_STRING, description="Name of the size (Used if 'size' ID is not provided; will create size if not found)", nullable=True),
    'color': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the color (Optional)', nullable=True),
    'color_name': openapi.Schema(type=openapi.TYPE_STRING, description="Name of the color (Used if 'color' ID is not provided; will create color if not found)", nullable=True),
    'color_hex': openapi.Schema(type=openapi.TYPE_STRING, description="Hex code for the color (Used with 'color_name' when creating)", nullable=True, example="#FF0000"),
    'sku': openapi.Schema(type=openapi.TYPE_STRING, description='Stock Keeping Unit (Must be unique or handled by service)'),
    'stock': openapi.Schema(type=openapi.TYPE_INTEGER, description='Available stock quantity', default=0),
    'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY, description='Variant specific image'),
    'weight_grams': openapi.Schema(type=openapi.TYPE_NUMBER, format=openapi.FORMAT_DECIMAL, description='Weight in grams', default=0.0),
    'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Is this variant available for sale?', default=True),
    'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description='(Likely unused for stock) Quantity field', default=0) # Giữ lại field từ model
}

class ProductVariantListCreateAPIView(APIView):
    """
    Liệt kê các biến thể (có thể lọc) hoặc tạo mới.
    Tự động tạo Size/Color nếu gửi tên thay vì ID.
    """
    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc POST).
        """
        if self.request.method == 'GET':
            # Cho phép bất kỳ ai truy cập phương thức GET (List)
            permission_classes = [permissions.AllowAny]
        else:
            # Yêu cầu là Admin (is_staff=True) cho các phương thức khác (POST)
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]
    @swagger_auto_schema(
        operation_summary="List Product Variants",
        operation_description="Retrieves a list of product variants. Can be filtered by product (via URL path or query param 'product'), active status, size ID, color ID, or SKU search.",
        manual_parameters=[
            # Thêm các filter query params nếu cần thiết cho endpoint không lồng nhau
            openapi.Parameter('active', openapi.IN_QUERY, description="Filter by active status ('true' or 'false')", type=openapi.TYPE_BOOLEAN, required=False),
            openapi.Parameter('size', openapi.IN_QUERY, description="Filter by Size ID", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('color', openapi.IN_QUERY, description="Filter by Color ID", type=openapi.TYPE_INTEGER, required=False),
            openapi.Parameter('sku', openapi.IN_QUERY, description="Search by SKU (contains)", type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: ProductVariantSerializer(many=True), 404: "Internal server erroe", 500: "Internal server erroe"},
        tags=['Product Variants']
    )
    def get(self, request, product_pk=None, format=None):
        try:
            product_filter_id = product_pk if product_pk else request.query_params.get('product')
            filters = {
                'is_active': _parse_query_param_bool(request.query_params.get('active')),
                'size_id': request.query_params.get('size'),
                'color_id': request.query_params.get('color'),
                'search': request.query_params.get('sku')
            }
            filters = {k: v for k, v in filters.items() if v is not None}

            if product_filter_id:
                 try: product_filter_id = int(product_filter_id)
                 except (ValueError, TypeError): return Response({"error": "Invalid Product ID provided."}, status=status.HTTP_400_BAD_REQUEST)

                 if not Product.objects.filter(pk=product_filter_id).exists():
                      return Response({"error": f"Product with ID {product_filter_id} not found."}, status=status.HTTP_404_NOT_FOUND)
                 variants = ProductVariantService.list_variants_for_product(product_filter_id)
            else:
                 logger.warning("Listing all product variants without product filter.")
                 variants = ProductVariant.objects.select_related('product', 'size', 'color').all()
                 if 'is_active' in filters: variants = variants.filter(is_active=filters['is_active'])
                 variants = variants.order_by('product__name', 'pk')


            serializer = ProductVariantSerializer(variants, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
             logger.error(f"Error listing product variants (product_pk={product_pk}): {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @swagger_auto_schema(
        operation_summary="Create Product Variant",
        operation_description="""Creates a new product variant.
        Requires 'product' (ID).
        Optionally provide 'size' (ID) or 'size_name' (string).
        Optionally provide 'color' (ID) or 'color_name' (string) and 'color_hex'.
        Size/Color will be created if 'size_name'/'color_name' is provided and doesn't exist.
        """,
        manual_parameters=[
             openapi.Parameter('product_pk', openapi.IN_PATH, description="(Optional) Product ID if using nested URL", type=openapi.TYPE_INTEGER, required=False)
        ] if 'product_pk' in locals() else [],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['size_name',  'stock','weight_grams','size_names', 'color_name', 'hex_code', 'image_url'],
            properties={
                'size_names': openapi.Schema(type=openapi.TYPE_STRING, description="Comma-separated list of size names (if not using size ID)"),
                'color_name': openapi.Schema(type=openapi.TYPE_STRING, description="Color name (if not using color ID)"),
                'hex_code': openapi.Schema(type=openapi.TYPE_STRING, description="Hex code for the color (if not using color ID)"),
                'weight_grams': openapi.Schema(type=openapi.TYPE_NUMBER, format=openapi.FORMAT_DECIMAL, description="Weight in grams"),
                'stock': openapi.Schema(type=openapi.TYPE_INTEGER, description="Available stock quantity", default=0),
                   'image_url': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_BINARY, description="Variant specific image"),}
        ),
        responses={
            201: ProductVariantSerializer,
            400: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Product Variants']
    )
    def post(self, request, product_pk=None, format=None):
        variant_data = {}
        if product_pk:
            variant_data['product'] = product_pk
        elif 'product' not in variant_data:
             return Response({"product": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        if request.data['size_names']:
            variant_data['size_names'] = [s.strip() for s in request.data['size_names'].split(',')]  # Tách thành list và loại bỏ khoảng trắng
        variant_data['color_name'] = request.data.get('color_name', None)  # Đảm bảo trường này tồn tại
        variant_data['hex_code'] = request.data.get('hex_code', None)  # Đảm bảo trường này tồn tại
        variant_data['stock'] = request.data.get('stock', 0)  # Đảm bảo trường này tồn tại
        variant_data['weight_grams'] = request.data.get('weight_grams', None)  # Đảm bảo trường này tồn tại
        variant_data['image_url'] = request.data.get('image_url', None)  # Đảm bảo trường này tồn tại
        print("variant_data: ", variant_data)

        try:
            variants = ProductVariantService.create_product_variant_with_attributes(variant_data)
            response_serializer = ProductVariantSerializer(variants, many=True, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except (ValueError, IntegrityError, ValidationError) as e:
            error_detail = getattr(e, 'detail', str(e))
            logger.warning(f"Failed to create variant: {error_detail}. Data: {request.data}")
            return Response({"error": error_detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error creating variant: {e}. Data: {request.data}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductVariantDetailAPIView(APIView):
    """
    Xem, cập nhật (PUT/PATCH), hoặc xóa một biến thể sản phẩm.
    """

    def get_permissions(self):
        """
        Ghi đè phương thức này để trả về danh sách permissions phù hợp
        dựa trên phương thức request (GET hoặc PUT/PATCH/DELETE).
        """
        if self.request.method == 'GET':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]

        return [permission() for permission in permission_classes]
    def _get_object(self, pk):
        variant = ProductVariantService.get_variant_by_id(pk)
        if not variant:
            raise Http404("Product Variant not found.")
        return variant

    @swagger_auto_schema(
        operation_summary="Retrieve Product Variant",
        operation_description="Retrieves the details of a specific product variant.",
        responses={
            200: ProductVariantSerializer,
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Product Variants']
    )
    def get(self, request, pk, format=None):
        try:
            variant = self._get_object(pk)
            serializer = ProductVariantSerializer(variant, context={'request': request})
            return Response(serializer.data)
        except Http404 as e:
             return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error retrieving variant {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Update Product Variant (Full)",
        operation_description="""Updates an existing product variant. Requires all fields except read-only ones.
        Cannot change the 'product' field.
        Can provide 'size'/'color' IDs or 'size_name'/'color_name' to update/create attributes.""",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['sku', 'stock'],
            properties={k:v for k,v in variant_request_schema_properties.items() if k != 'product'}
        ),
        responses={
            200: ProductVariantSerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Product Variants']
    )
    def put(self, request, pk, format=None):
        return self._handle_update(request, pk, partial=False)

    @swagger_auto_schema(
        operation_summary="Partial Update Product Variant",
        operation_description="""Partially updates an existing product variant. Only include fields to change.
        Cannot change the 'product' field.
        Can provide 'size'/'color' IDs or 'size_name'/'color_name' to update/create attributes.""",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={k:v for k,v in variant_request_schema_properties.items() if k != 'product'}
        ),
        responses={
            200: ProductVariantSerializer,
            400: "Internal server erroe",
            404: "Internal server erroe",
            500: "Internal server erroe",
        },
        tags=['Product Variants']
    )
    def patch(self, request, pk, format=None):
        return self._handle_update(request, pk, partial=True)

    def _handle_update(self, request, pk, partial):
        try:
            variant_data = request.data.copy()
            updated_variant = ProductVariantService.update_product_variant_with_attributes(pk, variant_data)
            response_serializer = ProductVariantSerializer(updated_variant, context={'request': request})
            return Response(response_serializer.data)
        except (ValueError, IntegrityError, ValidationError) as e:
            error_detail = getattr(e, 'detail', str(e))
            status_code = status.HTTP_400_BAD_REQUEST
            if "not found" in str(e).lower():
                 status_code = status.HTTP_404_NOT_FOUND
            logger.warning(f"Failed to {'patch' if partial else 'put'} variant {pk}: {error_detail}. Data: {request.data}")
            return Response({"error": error_detail}, status=status_code)
        except Http404:
             return Response({"error": "Product Variant not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Unexpected error {'patching' if partial else 'putting'} variant {pk}: {e}. Data: {request.data}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @swagger_auto_schema(
        operation_summary="Delete Product Variant",
        operation_description="Deletes a specific product variant by its ID.",
        responses={204: 'No Content', 404: "Internal server erroe", 500: "Internal server erroe"},
        tags=['Product Variants']
    )
    def delete(self, request, pk, format=None):
        try:
            success = ProductVariantService.delete_variant(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Product Variant not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             logger.error(f"Error deleting variant {pk}: {e}", exc_info=True)
             return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductVariantsBySlugAPIView(APIView):
    """
    Retrieve product variants by product slug.
    """

    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Retrieve Product Variants by Slug",
        operation_description="Retrieves all variants of a specific product by its slug.",
        responses={
            200: openapi.Response('OK', ProductVariantSerializer(many=True)),
            404: openapi.Response('Not Found'),
            500: openapi.Response('Internal Server Error'),
        },
        tags=['Product Variants']
    )
    def get(self, request, slug, format=None):
        try:
            variants = ProductVariantService.get_variants_by_product_slug(slug)
            if variants is None:
                return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ProductVariantSerializer(variants, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving variants for product slug '{slug}': {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductCategoriesAPIView(APIView):
    """
    API view to retrieve categories of a specific product.
    """
    def get(self, request, product_pk, format=None):
        try:
            # Get top-level categories for the product
            categories = Category.objects.filter(
                productcategory__product_id=product_pk, parent__isnull=True
            ).distinct()

            if not categories.exists():
                return Response({"error": "No categories found for this product."}, status=status.HTTP_404_NOT_FOUND)

            # Serialize the top-level categories
            serializer = CategorySerializer(categories, many=True, context={'request': request})

            # Add subcategories (categories directly associated with the product)
            for category in serializer.data:
                subcategories = Category.objects.filter(
                    productcategory__product_id=product_pk, parent_id=category['id']
                ).distinct()
                category['subcategories'] = BaseCategorySerializer(subcategories, many=True, context={'request': request}).data

            return Response(serializer.data[0])  # Return the first category with its subcategories
        except Exception as e:
            logger.error(f"Error retrieving categories for product {product_pk}: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductCategoriesBySlugAPIView(APIView):
    """
    API view to retrieve categories of a specific product by its slug.
    """
    def get(self, request, slug, format=None):
        try:
            # Get top-level categories for the product
            categories = Category.objects.filter(
                productcategory__product__slug=slug, parent__isnull=True
            ).distinct()

            if not categories.exists():
                return Response({"error": "No categories found for this product."}, status=status.HTTP_404_NOT_FOUND)

            # Serialize the top-level categories
            serializer = CategorySerializer(categories, many=True, context={'request': request})

            # Add subcategories (categories directly associated with the product)
            for category in serializer.data:
                subcategories = Category.objects.filter(
                    productcategory__product__slug=slug, parent_id=category['id']
                ).distinct()
                category['subcategories'] = BaseCategorySerializer(subcategories, many=True, context={'request': request}).data

            return Response(serializer.data[0])  # Return the first category with its subcategories
        except Exception as e:
            logger.error(f"Error retrieving categories for product slug '{slug}': {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)