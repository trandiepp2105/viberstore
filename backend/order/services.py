# order_app/services.py
import logging
import uuid # For generating order codes
from typing import List, Dict, Any, Optional, Tuple
from django.db import transaction, models
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model
from user.models import User

# import query set
from django.db.models import QuerySet
from marketing.services import CouponService

# import model class
from django.db.models import Model
# Import models from this app and related apps
from order.models import (
    OrderStatus, ShippingMethod, Order, OrderItem, CancelledOrder, OrderReutrnStatus, ReturnedOrder,
    OrderReturnedItem, OrderHistory, DeliveryMethod
)
from address.models import DeliveryAddress
from payment.models import PaymentMethod, PaymentStatus # Assuming these are in payment app
from cart.models import CartItem # Assuming cart items are here
from product.models import ProductVariant
# Import services from other apps if needed (e.g., CartService to clear cart)
from cart.services import CartService

logger = logging.getLogger(__name__)
User = get_user_model()

# --- Helper: Get Initial/Default Statuses ---
def get_initial_order_status() -> Optional[OrderStatus]:
    # Define your logic to get the first status (e.g., 'PENDING', 'WAITING_PAYMENT')
    try:
        # Make sure you have seeded these statuses in your DB
        return OrderStatus.objects.get(status_code__iexact='PENDING') # Example code
    except ObjectDoesNotExist:
        logger.error("Initial OrderStatus ('PENDING') not found in database!")
        return None

def get_standard_shipping_method() -> Optional[ShippingMethod]:
    # Define your logic to get the default shipping method (e.g., 'Standard', 'Express')
    try:
        return ShippingMethod.objects.get(method_code__iexact='STANDARD') # Example code
    except ObjectDoesNotExist:
        logger.error("Standard ShippingMethod not found in database!")
        return None
# --- Order History Service ---
class OrderHistoryService:
    @staticmethod
    def add_entry(order: Order, status: OrderStatus, staff_user: Optional[User] = None, note: Optional[str] = None):
        """Adds a new entry to the order history."""
        try:
            entry = OrderHistory.objects.create(
                order=order,
                status=status,
                staff_in_charge=staff_user,
                note=note
            )
            logger.info(f"Added history entry for Order {order.order_code}: Status '{status.status_code}', Staff: {staff_user.pk if staff_user else 'System'}")
            return entry
        except Exception as e:
            logger.error(f"Failed to add history for Order {order.order_code}: {e}", exc_info=True)
            # Decide if this error should halt the main process (e.g., raise RuntimeError)


# --- Order Service ---
class OrderService:

    @staticmethod
    def _generate_order_code() -> str:
        """Generates a unique order code."""
        # Simple example: timestamp + random part. Needs to be robust against collisions.
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_part = uuid.uuid4().hex[:6].upper()
        code = f"ORD-{timestamp}-{random_part}"
        # Ensure uniqueness (though collision is highly unlikely with this format)
        while Order.objects.filter(order_code=code).exists():
             random_part = uuid.uuid4().hex[:6].upper()
             code = f"ORD-{timestamp}-{random_part}"
        return code

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(
        user: User,
        payment_method_id: int,
        delivery_address_id: Optional[int] = None,
        customer_note: Optional[str] = None,
        cart_item_ids: Optional[List[int]] = None,
        coupons: Optional[List[str]] = None,
    ) -> Order:
        """
        Creates an Order from the user's current cart items.
        Checks stock, calculates totals, creates OrderItems, clears cart.
        """
        logger.info(f"Attempting to create order for User ID: {user.pk}")
        shipping_method_id = get_standard_shipping_method().pk if get_standard_shipping_method() else None
        # 1. Validate Inputs and Fetch Related Objects
        delivery_address = None
        if delivery_address_id:
            try:
                delivery_address = DeliveryAddress.objects.get(pk=delivery_address_id, user=user)
                print("Delivery info found:", delivery_address.id)
            except ObjectDoesNotExist:
                raise ValueError(f"Delivery info with ID {delivery_address_id} not found for this user.")
        try:
            shipping_method = ShippingMethod.objects.get(pk=shipping_method_id, is_active=True)
        except ObjectDoesNotExist:
            raise ValueError(f"Shipping method with ID {shipping_method_id} not found or is inactive.")

        try:
            payment_method = PaymentMethod.objects.get(pk=payment_method_id, is_active=True)
        except ObjectDoesNotExist:
            raise ValueError(f"Payment method with ID {payment_method_id} not found or is inactive.")

        initial_status = get_initial_order_status()
        if not initial_status:
            raise RuntimeError("System configuration error: Initial order status not found.")

        # 2. Fetch Cart Items and Check Stock/Availability
        # cart_items = CartService.list_cart_items(user).select_related('variant__product') # Ensure product is selected
        cart_items = CartService.get_cart_items_by_ids(user, cart_item_ids) if cart_item_ids else CartService.list_cart_items(user)
        if not cart_items:
            raise ValueError("Cannot create order: Cart is empty.")

        order_items_data = []
        total_amount = 0  # Sum of price
        final_amount = 0  # Sum of sale_price or price

        for item in cart_items:
            variant = item.variant
            # Double-check variant availability and stock at the time of order creation
            if not variant or not variant.is_active or not variant.product.is_published:
                raise ValueError(f"Item '{variant.product.name if variant else 'N/A'}' is no longer available.")
            if item.quantity > variant.stock:
                raise ValueError(f"Insufficient stock for '{variant.product.name}'. Requested: {item.quantity}, Available: {variant.stock}.")

            # Determine price at purchase (use int)
            product = variant.product
            price = int(product.price)
            sale_price = int(product.sale_price) if product.sale_price > 0 else price

            total_amount += item.quantity * price
            final_amount += item.quantity * sale_price
            selected_coupons = []
            if coupons:
                selected_coupons = CouponService.get_valid_coupons_by_ids(coupon_ids=coupons)

            # Calculate discounts and final amount
            discount = CouponService.calculate_discount(selected_coupons, total_amount)
            final_amount = final_amount - discount
            order_items_data.append({
                'variant': variant,
                'quantity': item.quantity,
                'price_at_purchase': price,
                # 'variant_details': f"Size: {variant.size.name if variant.size else 'N/A'}, Color: {variant.color.name if variant.color else 'N/A'}",
                'product_name': product.name,
                'variant_image': variant.image_url.url if variant.image_url else None,
                'sku': variant.sku,
                'size': variant.size.name if variant.size else None,
                'color': variant.color.name if variant.color else None,
                'sale_price_at_purchase': sale_price,
            })

            # *Crucially*, decrement stock here or ensure it's done later before finalizing
            # Option 1: Decrement now (simpler, but needs careful rollback)
            # variant.stock -= item.quantity
            # variant.save(update_fields=['stock'])
            # Option 2: Use select_for_update and decrement after Order is saved (safer)
            # See note below.

        # 3. Calculate Totals
        # Convert IntegerFields from model to int for calculation
        # shipping_fee = int(shipping_method.base_cost)
        shipping_fee = 0
        tax_rate = int(0.00) # Example: Get tax rate based on address or settings
        tax_amount = (total_amount + shipping_fee) * tax_rate # Example calculation
        final_amount += shipping_fee + tax_amount

        # 4. Create Order
        order_code = OrderService._generate_order_code()
        order = Order.objects.create(
            user=user,
            delivery_address=delivery_address,
            shipping_method=shipping_method,
            payment_method=payment_method,
            current_status=initial_status,
            order_code=order_code,
            total_amount=total_amount,  # Total price
            final_amount=final_amount,  # Total sale_price or price
            shipping_fee=shipping_fee,
            tax_amount=tax_amount,
            customer_note=customer_note,
            discount_amount=discount,  # Total discount amount
        )
        logger.info(f"Order {order.order_code} created for User ID {user.pk}.")

        # 5. Create OrderItems
        order_items_to_create = []
        for item_data in order_items_data:
            order_items_to_create.append(OrderItem(order=order, **item_data))

        if order_items_to_create:
            OrderItem.objects.bulk_create(order_items_to_create)
            logger.info(f"Created {len(order_items_to_create)} OrderItems for Order {order.order_code}.")

            # Option 2: Decrement stock *after* successful OrderItem creation
            for item_data in order_items_data:
                 variant = item_data['variant']
                 # Use F() expression for atomic update to avoid race conditions
                 ProductVariant.objects.filter(pk=variant.pk).update(stock=models.F('stock') - item_data['quantity'])
                 # Re-check stock after decrement (optional paranoia check)
                 # updated_variant = ProductVariant.objects.get(pk=variant.pk)
                 # if updated_variant.stock < 0:
                 #    logger.error(f"Stock went negative for Variant {variant.pk} during Order {order.order_code} creation!")
                 #    # This indicates a race condition or logic error, transaction should rollback.
                 #    raise ValidationError("Stock update resulted in negative quantity, order cancelled.")


        # 6. Add Initial History Entry
        OrderHistoryService.add_entry(order=order, status=initial_status, note="Order created.")

        # 7. Remove Cart Items
        try:
             CartService.delete_cart_items(user, cart_item_ids) if cart_item_ids else CartService.clear_cart(user)
        except Exception as cart_e:
             # Log the error but don't fail the order creation because of cart clearing issues
             logger.error(f"Failed to clear cart for user {user.pk} after order {order.order_code} creation: {cart_e}", exc_info=True)


        logger.info(f"Order {order.order_code} creation process completed successfully.")
        return order

    @staticmethod
    def list_orders_for_user(user: User, filters: Optional[Dict[str, Any]] = None) -> QuerySet[Order]:
        """Lists orders belonging to a specific user."""
        queryset = Order.objects.filter(user=user).select_related(
            'current_status', 'shipping_method', 'payment_method' # Common fields needed for list view
        ).prefetch_related(
             # Prefetch first few items for preview if needed, or all for detail calculation
             # models.Prefetch('items', queryset=OrderItem.objects.select_related('variant')[:3])
        )
        # Apply filters (status, date range, etc.)
        if filters:
             status_id = filters.get('status_id')
             # ... add other filters ...
             if status_id:
                 queryset = queryset.filter(current_status_id=status_id)

        return queryset.order_by('-order_date')

    @staticmethod
    def list_all_orders(filters: Optional[Dict[str, Any]] = None) -> QuerySet[Order]:
        """Lists all orders (for Admin)."""
        queryset = Order.objects.select_related(
            'user', 'current_status', 'shipping_method', 'payment_method'
        ).all()
        # Apply filters (status, date range, user_id, etc.)
        if filters:
             status_id = filters.get('status_id')
             user_id = filters.get('user_id')
             # ... add other filters ...
             if status_id: queryset = queryset.filter(current_status_id=status_id)
             if user_id: queryset = queryset.filter(user_id=user_id)
        return queryset.order_by('-order_date')

    @staticmethod
    def get_order_detail(order_id: int, user: Optional[User] = None) -> Optional[Order]:
        """
        Gets full order details.
        If user is provided, checks ownership. Otherwise, assumes admin access.
        """
        try:
            queryset = Order.objects.select_related(
                'user', 'delivery_address', 'shipping_method', 'current_status',
                'payment_method',  # Include payment method details
                'cancelled_order', 'returned_order'  # Include cancel/return details
            ).prefetch_related(
                'items__variant__product',  # Prefetch items and their variants/products
                'items__variant__size',
                'items__variant__color',
                'history__status',  # Prefetch history and its status
                'history__staff_in_charge',  # Prefetch staff user for history
                'returned_order__returned_items__order_item'  # Prefetch items within a return
            )
            if user:  # Check ownership if user is provided
                order = queryset.get(pk=order_id, user=user)
            else:  # Assume admin access if no user provided
                order = queryset.get(pk=order_id)
            return order
        except ObjectDoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def update_order_status(order_id: int, new_status_code: str, staff_user: User, note: Optional[str] = None) -> Order:
        """Updates the order status (Admin action)."""
        try:
            order = Order.objects.select_related('current_status').get(pk=order_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Order with ID {order_id} not found.")

        try:
            new_status = OrderStatus.objects.get(status_code__iexact=new_status_code)
        except ObjectDoesNotExist:
            raise ValueError(f"OrderStatus with code '{new_status_code}' not found.")

        if order.current_status == new_status:
            logger.info(f"Order {order.order_code} already has status '{new_status_code}'. No update needed.")
            return order # Or raise error? Depends on desired behavior

        # Add logic here to check if the status transition is valid (e.g., can't go from DELIVERED to PENDING)
        # if not is_valid_transition(order.current_status, new_status):
        #     raise ValueError(f"Invalid status transition from '{order.current_status.status_code}' to '{new_status_code}'.")

        old_status_code = order.current_status.status_code if order.current_status else "None"
        order.current_status = new_status
        order.save(update_fields=['current_status', 'updated_at']) # updated_at auto-updates

        # Add history entry
        history_note = f"Status changed from '{old_status_code}' to '{new_status_code}'."
        if note:
            history_note += f" Note: {note}"
        OrderHistoryService.add_entry(order=order, status=new_status, staff_user=staff_user, note=history_note)

        logger.info(f"Order {order.order_code} status updated to '{new_status_code}' by Staff ID {staff_user.pk}")

        # Add side effects here (e.g., trigger notifications, update payment if status is 'PAID')
        # if new_status.status_code == 'PAID':
        #     PaymentService.mark_as_paid(order.pk, ...)

        return order

    @staticmethod
    @transaction.atomic
    def process_order(order_id: int, staff_user: Optional[User] = None) -> Order:
        """
        Processes the order to the next status in the sequence: PENDING -> PACKED -> DELIVERING -> DELIVERED.
        """
        try:
            order = Order.objects.select_related('current_status').get(pk=order_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Order with ID {order_id} not found.")

        status_sequence = ["PENDING", "PACKED", "DELIVERING", "DELIVERED"]
        current_status_code = order.current_status.status_code if order.current_status else "PENDING"

        if current_status_code not in status_sequence:
            raise ValueError(f"Order status '{current_status_code}' cannot be processed further.")

        next_status_index = status_sequence.index(current_status_code) + 1
        if next_status_index >= len(status_sequence):
            raise ValueError(f"Order is already in the final status '{current_status_code}'.")

        next_status_code = status_sequence[next_status_index]
        next_status = OrderStatus.objects.get(status_code=next_status_code)

        order.current_status = next_status
        order.save(update_fields=['current_status', 'updated_at'])

        OrderHistoryService.add_entry(
            order=order,
            status=next_status,
            staff_user=staff_user,
            note=f"Order processed to status '{next_status_code}'."
        )

        return order

    @staticmethod
    @transaction.atomic
    def cancel_order(order_id: int, staff_user: Optional[User] = None, reason: Optional[str] = None) -> Order:
        """
        Cancels the order and creates a CancelledOrder record.
        """
        try:
            order = Order.objects.select_related('current_status').get(pk=order_id)
        except ObjectDoesNotExist:
            raise ValueError(f"Order with ID {order_id} not found.")

        if order.current_status and order.current_status.status_code in ["DELIVERED", "CANCELLED"]:
            raise ValueError(f"Order cannot be cancelled in its current status '{order.current_status.status_code}'.")

        cancelled_status = OrderStatus.objects.get(status_code="CANCELLED")
        order.current_status = cancelled_status
        order.save(update_fields=['current_status', 'updated_at'])

        CancelledOrder.objects.create(order=order, reason=reason)

        OrderHistoryService.add_entry(
            order=order,
            status=cancelled_status,
            staff_user=staff_user,
            note=f"Order cancelled. Reason: {reason}" if reason else "Order cancelled."
        )

        logger.info(f"Order {order.order_code} cancelled by {'Staff ID ' + str(staff_user.pk) if staff_user else 'the user'}.")
        return order

    @staticmethod
    @transaction.atomic
    def delete_order(order_id: int) -> bool:
        """
        Deletes the order and all related records.
        """
        try:
            order = Order.objects.get(pk=order_id)
            order.delete()

            
            return True
        except ObjectDoesNotExist:
            print(f"Order with ID {order_id} does not exist.")
            return False
        except Exception as e:
            print(f"Error deleting order: {e}")
            raise RuntimeError("Could not delete order.") from e


# --- Delivery Info Service ---
class DeliveryAddressService:
    @staticmethod
    def list_for_user(user: User) -> QuerySet[DeliveryAddress]:
        return DeliveryAddress.objects.filter(user=user).order_by('-is_default', '-updated_at')

    @staticmethod
    def get_by_id(delivery_address_id: int, user: User) -> Optional[DeliveryAddress]:
        try:
            return DeliveryAddress.objects.get(pk=delivery_address_id, user=user)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    @transaction.atomic
    def create_for_user(user: User, data: Dict[str, Any]) -> DeliveryAddress:
        is_default = data.get('is_default', False)
        # Ensure only one default address
        if is_default:
            DeliveryAddress.objects.filter(user=user, is_default=True).update(is_default=False)

        # Add user to data before creation
        data['user'] = user
        try:
             info = DeliveryAddress.objects.create(**data)
             logger.info(f"Created DeliveryAddress ID {info.pk} for User ID {user.pk}")
             return info
        except Exception as e:
             logger.error(f"Error creating DeliveryAddress for User ID {user.pk}: {e}", exc_info=True)
             raise RuntimeError("Could not create delivery info.") from e


    @staticmethod
    @transaction.atomic
    def update_for_user(delivery_address_id: int, user: User, data: Dict[str, Any]) -> DeliveryAddress:
        try:
            info = DeliveryAddress.objects.get(pk=delivery_address_id, user=user)
        except ObjectDoesNotExist:
            raise ValueError(f"DeliveryAddress with ID {delivery_address_id} not found for this user.")

        is_default = data.get('is_default')
        if is_default is True and not info.is_default:
            # If setting this as default, unset others
            DeliveryAddress.objects.filter(user=user, is_default=True).exclude(pk=delivery_address_id).update(is_default=False)
        elif is_default is False and info.is_default:
             # Cannot directly unset the *only* default address if there are multiple.
             # Add logic here if needed, e.g., require setting another as default first,
             # or automatically set the next oldest as default.
             # For simplicity now, we allow unsetting.
             pass

        # Update fields
        has_changes = False
        allowed_fields = ['is_default', 'recipient_name', 'province_city', 'district', 'ward_commune', 'specific_address', 'phone_number']
        for field in allowed_fields:
            if field in data and getattr(info, field) != data[field]:
                 setattr(info, field, data[field])
                 has_changes = True

        if has_changes:
             # updated_at is auto
             info.save()
             logger.info(f"Updated DeliveryAddress ID {info.pk} for User ID {user.pk}")

        return info

    @staticmethod
    @transaction.atomic
    def delete_for_user(delivery_address_id: int, user: User) -> bool:
        try:
            info = DeliveryAddress.objects.get(pk=delivery_address_id, user=user)
            # Add logic: Cannot delete the only address? Cannot delete default address?
            if info.is_default:
                 if DeliveryAddress.objects.filter(user=user).count() <= 1:
                     raise ValueError("Cannot delete the only delivery address.")
                 # Optionally set another address as default before deleting
                 # other_address = DeliveryAddress.objects.filter(user=user).exclude(pk=delivery_address_id).order_by('-updated_at').first()
                 # if other_address:
                 #     other_address.is_default = True
                 #     other_address.save(update_fields=['is_default'])

            info_id = info.pk
            info.delete()
            logger.info(f"Deleted DeliveryAddress ID {info_id} for User ID {user.pk}")
            return True
        except ObjectDoesNotExist:
             logger.warning(f"Attempted to delete non-existent/unowned DeliveryAddress ID {delivery_address_id} for User ID {user.pk}")
             return False
        except ValueError as e: # Catch specific errors like trying to delete the only address
            raise e # Re-raise validation errors
        except Exception as e:
             logger.error(f"Error deleting DeliveryAddress ID {delivery_address_id}: {e}", exc_info=True)
             raise RuntimeError("Could not delete delivery info.") from e

    @staticmethod
    @transaction.atomic
    def set_default(delivery_address_id: int, user: User) -> DeliveryAddress:
        """Sets a specific address as the default for the user."""
        try:
            info_to_set = DeliveryAddress.objects.get(pk=delivery_address_id, user=user)
            if info_to_set.is_default:
                return info_to_set # Already default

            # Unset current default(s)
            DeliveryAddress.objects.filter(user=user, is_default=True).update(is_default=False)

            # Set the new default
            info_to_set.is_default = True
            info_to_set.save(update_fields=['is_default', 'updated_at']) # updated_at is auto
            logger.info(f"Set DeliveryAddress ID {info_to_set.pk} as default for User ID {user.pk}")
            return info_to_set
        except ObjectDoesNotExist:
            raise ValueError(f"DeliveryAddress with ID {delivery_address_id} not found for this user.")
        except Exception as e:
             logger.error(f"Error setting default address for User ID {user.pk}: {e}", exc_info=True)
             raise RuntimeError("Could not set default delivery info.") from e


# --- Services for Lookup Tables (OrderStatus, ShippingMethod, etc.) ---
# These are typically simple CRUD managed by admins.

class LookupService:
    @staticmethod
    def _list(model_class: type[Model]):
        return model_class.objects.all().order_by('id')

    @staticmethod
    def _get(model_class: type[Model], pk: int):
        try: return model_class.objects.get(pk=pk)
        except ObjectDoesNotExist: return None

    @staticmethod
    def _create(model_class: type[Model], data: Dict[str, Any]):
        # Add validation if needed
        try: return model_class.objects.create(**data)
        except Exception as e: raise RuntimeError(f"Could not create {model_class.__name__}: {e}") from e

    @staticmethod
    def _update(model_class: type[Model], pk: int, data: Dict[str, Any]):
        instance = LookupService._get(model_class, pk)
        if not instance: raise ValueError(f"{model_class.__name__} with ID {pk} not found.")
        has_changes = False
        for field, value in data.items():
            if hasattr(instance, field): # Basic check
                if getattr(instance, field) != value:
                    setattr(instance, field, value)
                    has_changes = True
        if has_changes:
             # Add updated_at logic if model has it and doesn't use auto_now
             if hasattr(instance, 'updated_at'): instance.updated_at = timezone.now()
             instance.save()
        return instance

    @staticmethod
    def _delete(model_class: type[Model], pk: int) -> bool:
        instance = LookupService._get(model_class, pk)
        if instance:
            try:
                # Consider PROTECT or SET_NULL implications before deleting
                instance.delete()
                return True
            except Exception as e: raise RuntimeError(f"Could not delete {model_class.__name__} {pk}: {e}") from e
        return False

    # --- Public methods for each lookup type ---
    @staticmethod
    def list_order_statuses(): return LookupService._list(OrderStatus)
    @staticmethod
    def get_order_status(pk): return LookupService._get(OrderStatus, pk)
    # Add create/update/delete if needed for admin

    @staticmethod
    def list_shipping_methods(only_active=True):
        qs = ShippingMethod.objects.all()
        if only_active: qs = qs.filter(is_active=True)
        return qs.order_by('method_name')
    @staticmethod
    def get_shipping_method(pk): return LookupService._get(ShippingMethod, pk)
    # Add create/update/delete if needed

    @staticmethod
    def list_payment_methods(only_active=True):
        qs = PaymentMethod.objects.all()
        if only_active: qs = qs.filter(is_active=True)
        return qs.order_by('method_name')
    @staticmethod
    def get_payment_method(pk): return LookupService._get(PaymentMethod, pk)
    # Add create/update/delete if needed

    # Add similar methods for PaymentStatus, OrderReturnStatus if needed

# --- Payment, Cancellation, Return Services (Placeholder Structure) ---
# These would contain logic specific to those processes

class CancellationService:
     @staticmethod
     @transaction.atomic
     def cancel_order(order_id: int, user_requesting: User, reason: Optional[str] = None) -> Order:
         # Fetch order
         # Check if cancellation is allowed (based on current status)
         # Check permissions (is user the owner or admin?)
         # Update order status using OrderService
         # Create CancelledOrder record
         # Add OrderHistory entry
         # Potentially reverse stock (complex!)
         pass

class ReturnService:
     @staticmethod
     @transaction.atomic
     def request_return(order_id: int, user: User, items_data: List[Dict], general_reason: Optional[str] = None) -> ReturnedOrder:
          # Fetch order, check ownership
          # Validate items_data (order_item_id, quantity, reason) against order items
          # Check if return is allowed (e.g., within return window, based on status)
          # Calculate refund amounts based on price_at_purchase
          # Create ReturnedOrder with initial status
          # Create OrderReturnedItem records
          # Update Order status (e.g., 'RETURN_REQUESTED') using OrderService
          # Add OrderHistory entry
          pass

     @staticmethod
     @transaction.atomic
     def update_return_status(return_id: int, new_status_code: str, staff_user: User, note: Optional[str]=None):
          # Fetch ReturnedOrder, new status
          # Check valid transition
          # Update ReturnedOrder status, processed_at if completed/refunded
          # Update associated Order status if needed via OrderService
          # Add OrderHistory
          # If status indicates refund, potentially trigger refund process
          pass


class ShippingMethodService:
    @staticmethod
    def list_shipping_methods(only_active=True):
        """List all shipping methods, optionally filtering by active status."""
        queryset = ShippingMethod.objects.all()
        if only_active:
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('method_name')

    @staticmethod
    def get_shipping_method_by_id(method_id: int) -> Optional[ShippingMethod]:
        """Retrieve a shipping method by its ID."""
        try:
            return ShippingMethod.objects.get(pk=method_id)
        except ShippingMethod.DoesNotExist:
            return None

    @staticmethod
    def create_shipping_method(data: Dict[str, Any]) -> ShippingMethod:
        """Create a new shipping method."""
        try:
            shipping_method = ShippingMethod.objects.create(**data)
            return shipping_method
        except Exception as e:
            logger.error(f"Error creating shipping method: {e}", exc_info=True)
            raise RuntimeError("Could not create shipping method.") from e

    @staticmethod
    def update_shipping_method(method_id: int, data: Dict[str, Any]) -> ShippingMethod:
        """Update an existing shipping method."""
        try:
            shipping_method = ShippingMethod.objects.get(pk=method_id)
            for field, value in data.items():
                if hasattr(shipping_method, field):
                    setattr(shipping_method, field, value)
            shipping_method.save()
            return shipping_method
        except ShippingMethod.DoesNotExist:
            raise ValueError(f"Shipping method with ID {method_id} not found.")
        except Exception as e:
            logger.error(f"Error updating shipping method: {e}", exc_info=True)
            raise RuntimeError("Could not update shipping method.") from e

    @staticmethod
    def delete_shipping_method(method_id: int) -> bool:
        """Delete a shipping method."""
        try:
            shipping_method = ShippingMethod.objects.get(pk=method_id)
            shipping_method.delete()
            return True
        except ShippingMethod.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error deleting shipping method: {e}", exc_info=True)
            raise RuntimeError("Could not delete shipping method.") from e


class DeliveryMethodService:
    @staticmethod
    def list_delivery_methods():
        """Retrieve all delivery methods."""
        return DeliveryMethod.objects.all()