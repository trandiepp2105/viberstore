# Password Reset Token Implementation Plan

**Goal:** Require a backend-issued, short-lived, single-use reset token between OTP verification and password replacement.

**Architecture:** Persist one reset challenge per user in Django's database. Keep OTP and reset-token state server-side; return only an opaque reset token after successful OTP verification. Validate and consume that token before changing the password. Update the customer frontend to carry the token across its existing screens.

**Tech Stack:** Django 5.1, Django REST Framework, MySQL, Django cache, React.

**Files:** `backend/user/models.py` and a new user migration for challenge state; `backend/user/serializers.py` for request/confirm validation; `backend/user/services.py` for OTP/token lifecycle, password update, and token revocation; `backend/user/views.py` and `backend/user/urls.py` for the reset API; `backend/user/email_conf.py` for sending a supplied OTP; `frontend/src/services/userService.js` and `frontend/src/pages/RecoverPasswordPage/RecoverPasswordPage.jsx` for the revised contract.

**Constraints:** OTPs and reset tokens are purpose-bound, expire, are single-use, and are never logged. Reset tokens are not authentication tokens. Reset requests do not reveal whether an account exists. Existing signup email verification remains separate. Preserve unrelated workspace edits. Do not run tests unless requested.

**Review Focus:** Expired/incorrect OTP; OTP attempt exhaustion; replayed or expired reset token; unknown email enumeration; password-policy rejection; concurrent reset completion; existing signup OTP unaffected.

**Execution:** Implement the persistent challenge and service first, then wire API validation and frontend token handoff. Review the exact diff and perform non-test static checks only.
