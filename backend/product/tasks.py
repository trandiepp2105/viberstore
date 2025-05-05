from celery import shared_task
from django.utils import timezone
from .models import Product

@shared_task
def publish_scheduled_products():
    now = timezone.now()
    products_to_publish = Product.objects.filter(
        is_published=False,
        publish_at__isnull=False,
        publish_at__lte=now
    )
    # Update hiệu quả hơn cho nhiều bản ghi
    updated_count = products_to_publish.update(is_published=True)
    # Optional: Clear publish_at after publishing
    # products_to_publish.update(is_published=True, publish_at=None)
    if updated_count > 0:
        print(f"Published {updated_count} scheduled products.")
    return updated_count
