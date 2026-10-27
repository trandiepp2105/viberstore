"""Rate limits for unauthenticated password recovery endpoints."""

import hashlib

from rest_framework.throttling import SimpleRateThrottle


class PasswordResetIPThrottle(SimpleRateThrottle):
    """Apply the configured password-reset IP budget regardless of login state."""

    scope = "password_reset_ip"

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class PasswordResetEmailThrottle(SimpleRateThrottle):
    """Rate-limit by a hashed email identifier without storing email in cache keys."""

    def get_cache_key(self, request, view):
        email = request.data.get("email", "")
        if not isinstance(email, str) or not email.strip():
            return None
        identifier = hashlib.sha256(email.strip().lower().encode()).hexdigest()
        return self.cache_format % {"scope": self.scope, "ident": identifier}


class PasswordResetRequestEmailThrottle(PasswordResetEmailThrottle):
    """Limit OTP sends for each email address."""

    scope = "password_reset_request_email"


class PasswordResetVerifyEmailThrottle(PasswordResetEmailThrottle):
    """Limit OTP verification attempts for each email address."""

    scope = "password_reset_verify_email"
