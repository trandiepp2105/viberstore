# Generated for the password reset verification flow.
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PasswordResetChallenge",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("otp_hash", models.CharField(blank=True, max_length=64)),
                ("otp_expires_at", models.DateTimeField(blank=True, null=True)),
                ("otp_attempts", models.PositiveSmallIntegerField(default=0)),
                (
                    "reset_token_hash",
                    models.CharField(blank=True, db_index=True, max_length=64),
                ),
                (
                    "reset_token_expires_at",
                    models.DateTimeField(blank=True, null=True),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="password_reset_challenge",
                        to="user.user",
                    ),
                ),
            ],
            options={"db_table": "user_password_reset_challenge"},
        ),
    ]
