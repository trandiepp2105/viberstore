# backend/core/settings.py

from pathlib import Path
from datetime import timedelta
import os
from celery.schedules import crontab
# import pillow_avif # Đảm bảo đã cài đặt nếu bạn thực sự dùng AVIF và có thư viện libavif
# import pillow_heif # Đảm bảo đã cài đặt nếu bạn thực sự dùng HEIF và có thư viện libheif

BASE_DIR = Path(__file__).resolve().parent.parent
print(f"BASE_DIR: {BASE_DIR}")
# ==============================================================================
# CORE DJANGO SETTINGS FROM ENVIRONMENT
# ==============================================================================
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if os.environ.get('DJANGO_DEBUG', 'False') == 'True': # Chỉ cho phép fallback key yếu khi DEBUG=True
        SECRET_KEY = 'django-insecure-fallback-for-dev-if-not-set-in-env-and-debug-is-true'
        print("WARNING: DJANGO_SECRET_KEY not set in environment, using a weak fallback key for development.")
    else:
        raise ValueError("DJANGO_SECRET_KEY must be set in environment for production (DJANGO_DEBUG=False)!")

DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

# ==============================================================================
# ORIGIN & ALLOWED HOSTS CONFIGURATION (Sử dụng Public IP của VM và các port khác nhau)
# ==============================================================================
# FRONTEND_ORIGIN ví dụ: http://20.198.225.85 (không có port nếu là port 80)
# ADMIN_ORIGIN ví dụ: http://20.198.225.85:8088 (có port)
FRONTEND_ORIGIN_CONFIG = os.environ.get('FRONTEND_ORIGIN')
ADMIN_ORIGIN_CONFIG = os.environ.get('ADMIN_ORIGIN')

CSRF_TRUSTED_ORIGINS = []
if FRONTEND_ORIGIN_CONFIG:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_ORIGIN_CONFIG)
if ADMIN_ORIGIN_CONFIG:
    CSRF_TRUSTED_ORIGINS.append(ADMIN_ORIGIN_CONFIG) # Sẽ khác FRONTEND_ORIGIN_CONFIG do port

# Thêm các origin cho local development nếu DEBUG=True
if DEBUG:
    CSRF_TRUSTED_ORIGINS.extend([
        'http://localhost:3000', # Ví dụ port dev React frontend
        'http://localhost:3001', # Ví dụ port dev React admin
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ])
# Loại bỏ các giá trị None hoặc trùng lặp và đảm bảo không rỗng nếu cần
CSRF_TRUSTED_ORIGINS = list(set(filter(None, CSRF_TRUSTED_ORIGINS)))


CORS_ALLOWED_ORIGINS = []
if FRONTEND_ORIGIN_CONFIG:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_ORIGIN_CONFIG)
if ADMIN_ORIGIN_CONFIG:
    CORS_ALLOWED_ORIGINS.append(ADMIN_ORIGIN_CONFIG)
if DEBUG:
    CORS_ALLOWED_ORIGINS.extend([
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ])
CORS_ALLOWED_ORIGINS = list(set(filter(None, CORS_ALLOWED_ORIGINS)))
# Hoặc nếu muốn đơn giản hơn cho dev và không có origin cụ thể được đặt:
# if DEBUG and not CORS_ALLOWED_ORIGINS:
#     CORS_ALLOW_ALL_ORIGINS = True # Chỉ dùng cho development, không an toàn cho production

CORS_ALLOW_CREDENTIALS = True


ALLOWED_HOSTS_STR = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,viberstore_backend')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]
if not ALLOWED_HOSTS: # Đảm bảo không rỗng
    ALLOWED_HOSTS = ['localhost', '127.0.0.1'] # Fallback tối thiểu

# ==============================================================================
# APPLICATION DEFINITION
# ==============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_celery_beat',
    'drf_yasg',
    # Your Apps
    'user',
    'product',
    'cart',
    'order',
    'marketing',
    'feedback',
    'address',
    'payment',
]

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL") # Sẽ là None nếu không đặt trong .env
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") # Sẽ là None nếu không đặt trong .env

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Nên đặt sớm
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('MYSQL_DATABASE'),
        'USER': os.environ.get('MYSQL_USER'),
        'PASSWORD': os.environ.get('MYSQL_PASSWORD'),
        'HOST': os.environ.get('MYSQL_HOST'), # Sẽ là 'viberstore_mysql' từ .env
        'PORT': os.environ.get('MYSQL_PORT'), # Sẽ là '3309' từ .env
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
# # Kiểm tra các biến database bắt buộc
# for db_var in ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_PORT']:
#     if not DATABASES['default'][db_var[6:] if db_var.startswith('MYSQL_') else db_var.lower()]: # Lấy key tương ứng
#         if not DEBUG: # Chỉ raise lỗi nếu không phải DEBUG
#             raise ValueError(f"{db_var} for database must be set in environment for production!")
#         else:
#             print(f"WARNING: {db_var} for database is not set. Using fallback or will potentially fail.")
#             # Có thể đặt fallback ở đây nếu muốn cho dev, nhưng tốt hơn là đặt trong .env
#             if db_var == 'MYSQL_DATABASE': DATABASES['default']['NAME'] = 'dev_db'
#             if db_var == 'MYSQL_USER': DATABASES['default']['USER'] = 'dev_user'
#             # ...


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static') # Thư mục để `collectstatic` trong Dockerfile

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') # Thư mục cho media files

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'user.User'

# ==============================================================================
# REST FRAMEWORK & JWT CONFIGURATION
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

ALGORITHM = "HS256" # Hằng số, không nên thay đổi thường xuyên
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=int(os.environ.get("ACCESS_TOKEN_LIFETIME_HOURS", 5))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.environ.get("REFRESH_TOKEN_LIFETIME_DAYS", 1))),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': ALGORITHM,
    'SIGNING_KEY': SECRET_KEY, # Sử dụng SECRET_KEY của Django
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
    "TOKEN_OBTAIN_SERIALIZER": "user.serializers.CustomTokenObtainPairSerializer", # Đảm bảo serializer này tồn tại
    'JTI_CLAIM': 'jti',
}

# ==============================================================================
# EMAIL CONFIGURATION
# ==============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587)) # Ép kiểu sang int, có fallback
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER if EMAIL_HOST_USER else 'webmaster@localhost' # Fallback
if not (EMAIL_HOST_USER and EMAIL_HOST_PASSWORD) and not DEBUG: # Kiểm tra nếu không phải DEBUG
    print("WARNING: Email host user or password not configured. Email sending might fail.")


# ==============================================================================
# CACHE CONFIGURATION (Redis)
# ==============================================================================
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_CACHE_URL'), # Sẽ là redis://viberstore_redis:6379/1 từ .env
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            # 'PASSWORD': os.environ.get('REDIS_PASSWORD'), # Nếu Redis có password
        }
    }
}
if not CACHES['default']['LOCATION'] and not DEBUG:
    print("WARNING: REDIS_CACHE_URL not configured. Cache might not work as expected.")


# ==============================================================================
# VNPAY CONFIGURATION
# ==============================================================================
VNPAY_RETURN_URL = os.environ.get('VNPAY_RETURN_URL') # Sẽ là http://<VM_IP>/payment từ .env
VNPAY_PAYMENT_URL = os.environ.get('VNPAY_PAYMENT_URL')
VNPAY_API_URL = os.environ.get('VNPAY_API_URL')
VNPAY_TMN_CODE = os.environ.get('VNPAY_TMN_CODE')
VNPAY_HASH_SECRET_KEY = os.environ.get('VNPAY_HASH_SECRET_KEY')
# Kiểm tra các biến VNPAY bắt buộc
for vnpay_var in ['VNPAY_RETURN_URL', 'VNPAY_TMN_CODE', 'VNPAY_HASH_SECRET_KEY']:
    if not locals().get(vnpay_var) and not DEBUG: # locals().get() để lấy giá trị biến đã gán
        print(f"WARNING: {vnpay_var} for VNPAY is not set. VNPAY integration might fail.")


APPEND_SLASH = False

# ==============================================================================
# CELERY CONFIGURATION
# ==============================================================================
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL') # Sẽ là redis://viberstore_redis:6379/0 từ .env
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND') # Sẽ là redis://viberstore_redis:6379/0 từ .env
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE # Sử dụng TIME_ZONE đã định nghĩa ở trên
CELERY_ENABLE_UTC = False   # Tắt UTC khi đã dùng timezone cụ thể

CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_BEAT_SCHEDULE = {
    'publish-scheduled-products-job': {
        'task': 'product.tasks.publish_scheduled_products', # Đảm bảo task này tồn tại và import được
        'schedule': crontab(minute='*/5'), # Chạy mỗi 5 phút
    },
}
if (not CELERY_BROKER_URL or not CELERY_RESULT_BACKEND) and not DEBUG:
    print("WARNING: Celery Broker/Result backend URL not configured. Celery tasks might not work.")

# ==============================================================================
# ELASTICSEARCH CONFIGURATION (TẠM THỜI COMMENT - KHÔNG SỬ DỤNG)
# ==============================================================================
# Tạm thời không sử dụng Elasticsearch để giảm tải tài nguyên và độ phức tạp
# Có thể bỏ comment khi cần tích hợp tìm kiếm nâng cao

# ELASTICSEARCH_DSL_URL = os.environ.get('ELASTICSEARCH_URL') # http://elasticsearch:9200 từ .env
# ELASTICSEARCH_DSL_USER = os.environ.get('ELASTIC_USERNAME')
# ELASTICSEARCH_DSL_PASS = os.environ.get('ELASTIC_PASSWORD')

# ELASTICSEARCH_DSL = {
#     'default': {
#         'hosts': ELASTICSEARCH_DSL_URL if ELASTICSEARCH_DSL_URL else 'http://localhost:9200', # Fallback
#         'http_auth': (ELASTICSEARCH_DSL_USER, ELASTICSEARCH_DSL_PASS)
#                       if ELASTICSEARCH_DSL_USER and ELASTICSEARCH_DSL_PASS else None,
#     },
# }
# if not ELASTICSEARCH_DSL['default']['hosts'] and not DEBUG:
#      print("WARNING: Elasticsearch URL not configured for django-elasticsearch-dsl.")