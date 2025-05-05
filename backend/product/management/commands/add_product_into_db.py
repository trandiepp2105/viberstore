import pandas as pd
from product.models import Product, ProductImage, Category, ProductCategory, Series, ProductVariant, Attribute, Specification
from django.db import transaction
import json
from django.core.management.base import BaseCommand, CommandError

def convert_price_to_number(price_string):
    """
    Chuyển đổi chuỗi giá tiền từ dạng '12.990.000đ' thành số.
    
    Args:
        price_string (str): Chuỗi giá tiền.
        
    Returns:
        int: Giá tiền ở dạng số nguyên.
    """
    # Loại bỏ các ký tự không phải số
    price_cleaned = ''.join(filter(str.isdigit, price_string))
    # Chuyển đổi chuỗi thành số nguyên
    if price_cleaned:
        return int(price_cleaned)
    return None


def search_series(product_name, series_list):
    # Duyệt qua từng series trong danh sách
    for series in series_list:
        # Kiểm tra nếu product_name tồn tại trong danh sách sản phẩm của series
        if product_name in series["products"]:
            return series['name']  # Trả về series đầu tiên tìm thấy
    return None  # Nếu không tìm thấy thì trả về None    

def search_specification(product_id, specification_list):
    # Duyệt qua từng specification trong danh sách
    for specification in specification_list:
        if product_id == specification["product_id"]:
            return specification['detail']
    return None  

def import_specification_data(specification_data, product):
    for parent_name, sub_specifications in specification_data.items():
        parent_attribute, _ = Attribute.objects.get_or_create(name=parent_name, parent=None)
        for sub_specification in sub_specifications:
            child_name = sub_specification.get("name")
            value = sub_specification.get("value")
            if not child_name or not value:
                continue
            child_attribute, _ = Attribute.objects.get_or_create(name=child_name, parent=parent_attribute)

            # Tạo Specification
            Specification.objects.create(
                product=product,
                attribute=child_attribute,
                value=value
            )


def import_product_variant(variant_data, images_data, product):
    for variant in variant_data:
        image_id = variant.get("image_id")
        price = variant.get("price")
        name = variant.get("name")
        image_url = None
        is_main = False

        for index in range(len(images_data)):
            if image_id == images_data[index]["id"]:
                image_url = images_data[index]["url"]
                is_main = images_data[index]["is_main"]
                del images_data[index]
                break
        # for idx, image in images_data:
        #     if image_id == image["id"]:
        #         image_url = image["url"]
        #         del images_data[idx]
        #         break
        image = None
        if image_url:
            image, _ = ProductImage.objects.get_or_create(product=product, url=image_url, is_main=is_main)
        ProductVariant.objects.create(
            product=product,
            image=image,
            price=convert_price_to_number(price),
            name=name
        )

def get_category_name(product_data):
    category_reference = {
        "dong-ho-dinh-vi-tre-em": "WATCH_KIDS_SMARTWATCH",
        "dong-ho-do-huyet-ap": "WATCH_BLOOD_PRESSURE_MONITOR",
        "dong-ho-the-thao": "WATCH_SPORT",
        "dong-ho-thong-minh-chong-nuoc": "WATCH_WATER_RESISTANT",
        "dong-ho-thong-minh-nghe-goi": "WATCH_CALLING",
        "vong-tay-thong-minh": "WATCH_SMART_BRACELET",
    }
    product_name = product_data['name']
    product_name = product_name.split(" ")[0].lower()
    category_name = product_data['category_name']
    if product_name == "laptop":
        category_name = category_name.upper()
        return f"LAPTOP_{category_name}"
    return category_reference.get(category_name, None)


def create_product_with_images(product_data, images_data, variant_data, specification_data, series_data):
    try:
        with transaction.atomic():

            # Get product series            
            series_name = search_series(product_data['name'], series_data)
            series = None
            if series_name:
                series, _ = Series.objects.get_or_create(name=series_name)

            # Create product
            product = Product.objects.create(
                name=product_data['name'],
                price_show=convert_price_to_number(product_data['price_sale']),
                price_through=convert_price_to_number(product_data['price_through']),
                stock= 100,
                series=series
            )

            # Create product category
            category_name = get_category_name(product_data)
            ProductCategory.objects.create(
                product=product,
                category=Category.objects.get(name=category_name)
            )

            # Create product variant
            import_product_variant(variant_data, images_data, product)

            # Create product specification
            import_specification_data(specification_data, product)
            # Tạo hình ảnh cho sản phẩm
            for image in images_data:
                ProductImage.objects.create(
                    product=product,
                    url=image['url'],
                    is_main=image.get('is_main', False)
                )

    except Exception as e:
        raise CommandError(f'Error: {e}')
        # print(f"Error: {e}")
        # Nếu có lỗi xảy ra, toàn bộ giao dịch sẽ bị rollback


class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
    # def handle(self, *args, **options):
    #     ProductImage.objects.all().delete()
    #     ProductCategory.objects.all().delete()
    #     ProductVariant.objects.all().delete()
    #     Specification.objects.all().delete()
    #     Attribute.objects.all().delete()
    #     Series.objects.all().delete()
    #     Product.objects.all().delete()
    #     self.stdout.write(self.style.SUCCESS(f'All data deleted!'))

    def handle(self, *args, **options):
        count_success = 0
        product_data = pd.read_csv("./ProductLink/products.csv")
        images_data = pd.read_csv("./ProductLink/images.csv")
        images_data['url'] = images_data['url'].str.replace('./', 'http://127.0.0.1:8000/media/product/', regex=False)

        variant_data = pd.read_csv("./ProductLink/variants.csv")
        with open("./ProductLink/series.json", 'r', encoding='utf-8') as file:
            series_data = json.load(file)
        with open("./ProductLink/specifications.json", 'r', encoding='utf-8') as file:
            specification_data = json.load(file)

        for index, product_row in product_data.iterrows():
            specific_image_data = images_data[images_data['product_id'] == product_row['id']]
            specific_variant_data = variant_data[variant_data['product_id'] == product_row['id']]
            specific_specification_data = search_specification(product_row['id'], specification_data)
            try:
                create_product_with_images(
                    product_row,
                    specific_image_data.to_dict(orient='records'),
                    specific_variant_data.to_dict(orient='records'),
                    specific_specification_data,
                    series_data
                )
                self.stdout.write(self.style.SUCCESS(f'Row {index} successfully loaded!'))
                count_success += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Row {index} failed to load!'))
                print(f"Error: {e}")
        self.stdout.write(self.style.SUCCESS(f'{count_success} successfully loaded!'))

