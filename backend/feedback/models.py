# feedback_app/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _ # For choices
from .enums import ReviewStatus # Assuming enums.py is in the same app

class Review(models.Model):
    product = models.ForeignKey(
        'product.Product', # Use string reference to avoid circular imports
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_("Product")
    )
    order = models.ForeignKey(
        'order.Order', # Use string reference
        on_delete=models.CASCADE, # Or SET_NULL if you want reviews to remain after order deletion? CASCADE seems more logical.
        related_name='reviews',
        verbose_name=_("Order")
    )
    user = models.ForeignKey(
        'user.User', # Use string reference
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_("User")
    )
    rating = models.PositiveSmallIntegerField(
        verbose_name=_("Rating"),
        # Create choices tuple directly
        choices=[(i, str(i)) for i in range(1, 6)],
        blank=True,
        null=True # Allow reviews without a star rating (comment only)
    )
    comment = models.TextField(verbose_name=_("Comment"), blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=ReviewStatus.choices, # Use choices directly from Enum
        default=ReviewStatus.PENDING, # Use Enum value for default
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    # Add updated_at if you allow users/admins to edit reviews
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        ordering = ['-created_at']
        db_table = 'review'  # Add db_table option
        # Prevent duplicate reviews for the same product/order/user combination
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'order', 'user'],
                name='unique_user_product_order_review'
            )
        ]
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        rating_str = f"{self.rating} Star{'s' if self.rating > 1 else ''}" if self.rating else 'Comment'
        return f"{rating_str} by {self.user.email} for {self.product.name}"

    def clean(self):
        # Ensure either rating or comment is provided
        if self.rating is None and not self.comment:
            raise models.ValidationError(_("A review must have at least a rating or a comment."))
        super().clean()

    # Optional: Add save method if complex logic needed, but often better in service
    # def save(self, *args, **kwargs):
    #     self.full_clean() # Run validation before saving
    #     super().save(*args, **kwargs)