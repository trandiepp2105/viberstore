from django.db import models
from product.models import Product, ProductVariant
# Create your models here.

class CartItem(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='cart_items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)  # Thêm trường variant
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"CartItem(user={self.user}, variant={self.variant}, quantity={self.quantity})"    
    
    def change_quantity(self, quantity):
        """
        Change the quantity of the cart item.
        If the quantity is less than or equal to 0, delete the item.
        If the quantity is greater than 0, and less than stock in product variant (if exists), update the quantity.
        :param quantity: The new quantity to set.
        :return: None
        """
        if quantity <= 0:
            self.delete()
        else:
            if self.variant and quantity > self.variant.stock:
                raise ValueError("Quantity exceeds available stock.")
            self.quantity = quantity
            self.save()
    
    class Meta:
        db_table = 'cart_item'


