"""Password reset use cases and their security-sensitive state transitions."""

import hashlib
import hmac
import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .email_conf import send_html_email_with_otp
from .models import PasswordResetChallenge, User

logger = logging.getLogger(__name__)

OTP_TTL = timedelta(minutes=5)
RESET_TOKEN_TTL = timedelta(minutes=10)
MAX_OTP_ATTEMPTS = 5


def _otp_digest(user_id: int, otp: str) -> str:
    """Return a keyed digest so a database leak does not reveal active OTPs."""
    return hmac.new(
        settings.SECRET_KEY.encode(),
        f"password-reset:{user_id}:{otp}".encode(),
        hashlib.sha256,
    ).hexdigest()


def _reset_token_digest(token: str) -> str:
    """Hash an opaque reset token before storing it in the database."""
    return hashlib.sha256(token.encode()).hexdigest()


class PasswordResetService:
    """Coordinate password reset OTPs, reset tokens, password changes, and revocation."""

    @staticmethod
    def request_reset(email: str) -> None:
        """Create a short-lived OTP for an active account and send it by email.

        Unknown and inactive accounts intentionally produce no side effect; the
        API returns the same public response for those cases as for valid users.
        """
        user = User.objects.filter(email__iexact=email.strip(), is_active=True).first()
        if user is None:
            return

        otp = f"{secrets.randbelow(1_000_000):06d}"
        now = timezone.now()
        PasswordResetChallenge.objects.update_or_create(
            user=user,
            defaults={
                "otp_hash": _otp_digest(user.pk, otp),
                "otp_expires_at": now + OTP_TTL,
                "otp_attempts": 0,
                "reset_token_hash": "",
                "reset_token_expires_at": None,
            },
        )

        try:
            send_html_email_with_otp(user.email, otp)
        except Exception:
            # Do not log the address or OTP. The public response stays generic.
            logger.error("Password reset email delivery failed.")

    @staticmethod
    def verify_otp(email: str, otp: str) -> str:
        """Consume a valid OTP and return a short-lived reset-only token.

        The returned token is not a login credential. Its digest is stored and
        the raw token is shown to the client only once.
        """
        reset_token = secrets.token_urlsafe(32)
        invalid_otp = False
        now = timezone.now()

        with transaction.atomic():
            user = User.objects.filter(email__iexact=email.strip(), is_active=True).first()
            challenge = None
            if user is not None:
                challenge = (
                    PasswordResetChallenge.objects.select_for_update()
                    .filter(user=user)
                    .first()
                )

            if (
                challenge is None
                or challenge.otp_expires_at is None
                or challenge.otp_expires_at <= now
                or challenge.otp_attempts >= MAX_OTP_ATTEMPTS
                or not hmac.compare_digest(
                    challenge.otp_hash,
                    _otp_digest(user.pk, otp),
                )
            ):
                invalid_otp = True
                if (
                    challenge is not None
                    and challenge.otp_expires_at is not None
                    and challenge.otp_expires_at > now
                    and challenge.otp_attempts < MAX_OTP_ATTEMPTS
                ):
                    challenge.otp_attempts += 1
                    challenge.save(update_fields=["otp_attempts", "updated_at"])
            else:
                challenge.otp_hash = ""
                challenge.otp_expires_at = None
                challenge.reset_token_hash = _reset_token_digest(reset_token)
                challenge.reset_token_expires_at = now + RESET_TOKEN_TTL
                challenge.save(
                    update_fields=[
                        "otp_hash",
                        "otp_expires_at",
                        "reset_token_hash",
                        "reset_token_expires_at",
                        "updated_at",
                    ]
                )

        if invalid_otp:
            raise ValidationError({"otp": "Mã OTP không hợp lệ hoặc đã hết hạn."})
        return reset_token

    @staticmethod
    @transaction.atomic
    def complete_reset(reset_token: str, new_password: str) -> None:
        """Validate and consume a reset token, change the password, and revoke refresh tokens."""
        now = timezone.now()
        token_digest = _reset_token_digest(reset_token)
        challenge = (
            PasswordResetChallenge.objects.select_for_update()
            .select_related("user")
            .filter(reset_token_hash=token_digest)
            .first()
        )
        if (
            challenge is None
            or challenge.reset_token_expires_at is None
            or challenge.reset_token_expires_at <= now
            or not challenge.user.is_active
        ):
            raise ValidationError(
                {"reset_token": "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
            )

        try:
            validate_password(new_password, user=challenge.user)
        except DjangoValidationError as error:
            raise ValidationError({"new_password": list(error.messages)}) from error

        challenge.user.set_password(new_password)
        challenge.user.save(update_fields=["password"])

        challenge.otp_hash = ""
        challenge.otp_expires_at = None
        challenge.otp_attempts = 0
        challenge.reset_token_hash = ""
        challenge.reset_token_expires_at = None
        challenge.save(
            update_fields=[
                "otp_hash",
                "otp_expires_at",
                "otp_attempts",
                "reset_token_hash",
                "reset_token_expires_at",
                "updated_at",
            ]
        )

        for outstanding_token in OutstandingToken.objects.filter(user=challenge.user):
            try:
                RefreshToken(outstanding_token.token).blacklist()
            except TokenError:
                # Expired or malformed tokens cannot be used to authenticate.
                continue
