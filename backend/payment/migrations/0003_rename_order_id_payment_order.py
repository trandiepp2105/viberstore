# Generated by Django 5.1.3 on 2025-04-29 07:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0002_paymentmethod_image_url'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='order_id',
            new_name='order',
        ),
    ]
