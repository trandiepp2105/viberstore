# Generated by Django 5.1.3 on 2025-04-24 16:06

import django.db.models.deletion
import django.utils.timezone
import product.enums
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Color',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Color Name')),
                ('hex_code', models.CharField(max_length=7, verbose_name='Hex Code')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True, verbose_name='Updated At')),
            ],
            options={
                'db_table': 'color',
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='Product Name')),
                ('slug', models.SlugField(default='product-name', max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('cost_price', models.IntegerField(default=0, verbose_name='Cost Price')),
                ('price', models.IntegerField(default=0, verbose_name='Cost Price')),
                ('sale_price', models.IntegerField(default=0, verbose_name='Cost Price')),
                ('is_published', models.BooleanField(default=False, verbose_name='Is Published')),
                ('publish_at', models.DateTimeField(blank=True, db_index=True, default=None, help_text="Set a future date/time to publish the product automatically. Product will only appear if 'Published Status' is also checked AND this time is reached (or if this field is blank).", null=True, verbose_name='Scheduled Publish Time')),
                ('image_url', models.ImageField(blank=True, null=True, upload_to='products/', verbose_name='Image URL')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True, verbose_name='Updated At')),
            ],
            options={
                'db_table': 'product',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Size',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Size Name')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True, verbose_name='Updated At')),
            ],
            options={
                'db_table': 'size',
            },
        ),
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=255, unique=True, verbose_name='Company Name')),
                ('slug', models.SlugField(blank=True, max_length=255, unique=True, verbose_name='Slug')),
                ('contact_person', models.CharField(max_length=255, verbose_name='Contact Person')),
                ('email', models.EmailField(max_length=255, unique=True, verbose_name='Email')),
                ('phone_number', models.CharField(max_length=20, unique=True, verbose_name='Phone Number')),
                ('address', models.CharField(max_length=255, verbose_name='Address')),
                ('tax_id', models.CharField(max_length=20, verbose_name='Tax ID')),
                ('status', models.CharField(choices=product.enums.SupplierStatus.choices, default=product.enums.SupplierStatus['ACTIVE'], max_length=20)),
                ('website', models.URLField(max_length=255, verbose_name='Website')),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Started At')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True, verbose_name='Updated At')),
            ],
            options={
                'db_table': 'supplier',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(default='category-name', max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('image_url', models.ImageField(blank=True, null=True, upload_to='categories/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='subcategories', to='product.category')),
            ],
            options={
                'db_table': 'category',
            },
        ),
        migrations.CreateModel(
            name='ProductCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='product.category')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='product_categories', to='product.product')),
            ],
            options={
                'db_table': 'product_category',
            },
        ),
        migrations.CreateModel(
            name='ProductVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sku', models.CharField(max_length=255, verbose_name='SKU')),
                ('stock', models.PositiveIntegerField(default=0, verbose_name='Stock')),
                ('image_url', models.ImageField(blank=True, null=True, upload_to='product_variants/', verbose_name='Image URL')),
                ('weight_grams', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Weight (grams)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(blank=True, default=None, null=True, verbose_name='Updated At')),
                ('color', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='product.color', verbose_name='Color')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='product.product')),
                ('size', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='product.size', verbose_name='Size')),
            ],
            options={
                'db_table': 'product_variant',
            },
        ),
        migrations.AddField(
            model_name='product',
            name='supplier',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='product.supplier'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['slug'], name='product_slug_b8980b_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['name'], name='product_name_c4c985_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['publish_at'], name='product_publish_afb2b9_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_published'], name='product_is_publ_edb21a_idx'),
        ),
    ]
