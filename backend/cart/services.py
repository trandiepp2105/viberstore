import logging
from typing import List, Optional, Tuple
from django.contrib.auth import get_user_model
from django.db import transaction, models
from django.core.exceptions import ObjectDoesNotExist, ValidationError

from cart.models import CartItem
# Adjust import paths as needed
from product.models import ProductVariant
from user.models import User
logger = logging.getLogger(__name__)

class CartService:
    """Encapsulates business logic for cart operations."""

    @staticmethod
    def list_cart_items(user: User) -> models.QuerySet[CartItem]:
        """Retrieves all cart items for a given user, optimizing related lookups."""
        return CartItem.objects.filter(user=user).select_related(
            'variant__product', 'variant__size', 'variant__color'
        ).order_by('created_at')

    @staticmethod
    @transaction.atomic
    def add_or_update_item(user: User, variant_id: int, quantity: int) -> Tuple[Optional[CartItem], bool, str]:
        """
        Adds a new item or updates the quantity of an existing item in the user's cart.
        Handles stock checking and removal if quantity is zero.

        Args:
            user: The user performing the action.
            variant_id: The ID of the ProductVariant.
            quantity: The desired final quantity (0 to remove).

        Returns:
            Tuple (CartItem or None, created_or_updated (bool), message (str)):
            - CartItem: The created/updated item, or None if removed.
            - bool: True if an item was created or updated, False otherwise (e.g., validation error).
            - str: A message indicating the result or error.
        """
        if not isinstance(quantity, int) or quantity < 0:
            return None, False, "Quantity must be a non-negative integer."

        try:
            # 1. Validate Variant (checks active status and published status of product)
            variant = ProductVariant.objects.select_related('product').get(
                pk=variant_id,
                is_active=True,
                product__is_published=True
            )
        except ObjectDoesNotExist:
            logger.warning(f"User {user.pk} tried to add non-existent/inactive variant {variant_id}")
            return None, False, "Product variant not found or is not available."

        # 2. Handle Quantity = 0 (Remove item)
        if quantity == 0:
            deleted_count, _ = CartItem.objects.filter(user=user, variant=variant).delete()
            if deleted_count > 0:
                logger.info(f"Removed variant {variant_id} from cart for user {user.pk}")
                return None, True, "Item removed from cart."
            else:
                return None, False, "Item not found in cart to remove." # Item wasn't there

        # 3. Handle Quantity > 0 (Add/Update item)
        # Check stock BEFORE creating/updating
        if quantity > variant.stock:
            logger.warning(f"User {user.pk} tried to add variant {variant_id} qty {quantity}, stock is {variant.stock}")
            # Return existing item state if update fails due to stock? Or just error? Let's error.
            # current_item = CartItem.objects.filter(user=user, variant=variant).first()
            return None, False, f"Requested quantity ({quantity}) exceeds available stock ({variant.stock})."

        # Use update_or_create for atomicity and simplicity
        cart_item, created = CartItem.objects.update_or_create(
            user=user,
            variant=variant,
            defaults={'quantity': quantity} # Set the quantity directly
        )

        action = "added to" if created else "updated in"
        logger.info(f"Variant {variant_id} qty {quantity} {action} cart for user {user.pk}")
        return cart_item, True, f"Item {action} cart."


    @staticmethod
    @transaction.atomic
    def remove_item(user: User, cart_item_id: int) -> bool:
        """Removes a specific item from the user's cart."""
        deleted_count, _ = CartItem.objects.filter(user=user, pk=cart_item_id).delete()
        if deleted_count > 0:
            logger.info(f"Removed cart item {cart_item_id} for user {user.pk}")
            return True
        else:
            logger.warning(f"User {user.pk} tried to remove non-existent/unowned cart item {cart_item_id}")
            return False # Return False indicates not found or not owned

    @staticmethod
    @transaction.atomic
    def clear_cart(user: User) -> int:
        """Removes all items from the user's cart."""
        deleted_count, _ = CartItem.objects.filter(user=user).delete()
        if deleted_count > 0:
             logger.info(f"Cleared {deleted_count} items from cart for user {user.pk}")
        return deleted_count

    @staticmethod
    def get_cart_item_by_id(user: User, cart_item_id: int) -> Optional[CartItem]:
        """Retrieves a specific cart item owned by the user."""
        try:
            # Ensure necessary relations for the serializer are fetched
            return CartItem.objects.select_related(
                'variant__product__supplier', 'variant__size', 'variant__color'
            ).get(user=user, pk=cart_item_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def get_cart_items_by_ids(user: User, cart_item_ids: List[int]) -> List[CartItem]:
        """Retrieves multiple cart items owned by the user."""
        return list(CartItem.objects.filter(user=user, pk__in=cart_item_ids))
    
    @staticmethod
    @transaction.atomic
    def delete_cart_items(user: User, cart_item_ids: List[int]) -> int:
        """
        Deletes multiple cart items for the given user.

        Args:
            user: The user performing the action.
            cart_item_ids: A list of cart item IDs (int).

        Returns:
            int: The number of deleted cart items.
        """
        if not isinstance(cart_item_ids, list) or not all(isinstance(item, int) for item in cart_item_ids):
            raise ValueError("cart_item_ids must be a list of integers.")

        # Query the cart items by IDs
        cart_items_queryset = CartItem.objects.filter(user=user, pk__in=cart_item_ids)

        # Delete the cart items
        deleted_count, _ = cart_items_queryset.delete()
        logger.info(f"Deleted {deleted_count} cart items for user {user.pk}")
        return deleted_count
    
    @staticmethod
    @transaction.atomic
    def update_cart_item_variant(user: User, cart_item_id: int, new_variant_id: int) -> Tuple[bool, str]:
        """
        Updates the variant of a cart item, checks stock, and adjusts quantity if necessary.

        Args:
            user: The user performing the action.
            cart_item_id: The ID of the CartItem to update.
            new_variant_id: The ID of the new ProductVariant.

        Returns:
            Tuple (success (bool), message (str)):
            - bool: True if the update was successful, False otherwise.
            - str: A message indicating the result or error.
        """
        try:
            # Fetch the cart item
            cart_item = CartItem.objects.select_related('variant').get(user=user, pk=cart_item_id)
        except ObjectDoesNotExist:
            return False, "Cart item not found."

        try:
            # Fetch the new variant
            new_variant = ProductVariant.objects.select_related('product').get(
                pk=new_variant_id,
                is_active=True,
                product__is_published=True
            )
        except ObjectDoesNotExist:
            return False, "New product variant not found or is not available."

        # Check stock of the new variant
        if new_variant.stock <= 0:
            return False, "The selected variant is out of stock."

        # Adjust quantity if necessary
        if new_variant.stock < cart_item.quantity:
            cart_item.quantity = new_variant.stock

        # Check if the adjusted quantity is valid for the current variant
        if cart_item.quantity > new_variant.stock:
            return False, f"Requested quantity exceeds available stock for the new variant ({new_variant.stock})."

        # Update the cart item with the new variant and adjusted quantity
        cart_item.variant = new_variant
        cart_item.save()

        return True, "Cart item updated successfully."