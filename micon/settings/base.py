"""
Django settings for competition_project project.

Generated by 'django-admin startproject' using Django 1.10.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '%mw@enk-%k+jh%pv8p-t!a#vh1t^7(o$e28et!8rgs00q@e9@!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    'rest_framework',
    'rest_framework.authtoken',
    'rest_auth',
    'rest_auth.registration',

    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',

    'authentication',
    'core',
    'payment',
    'competitions',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'media_files.middleware.MediaDeniedMiddleware',
    'media_files.middleware.AdminRequiredMiddleware',
]


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)



ROOT_URLCONF = 'micon.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ]
        ,
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

WSGI_APPLICATION = 'micon.wsgi.application'


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

MEDIA_URL = '/media/'

MEDIA_ROOT = os.path.join(BASE_DIR, "media")

STATIC_URL = '/static/'

STATIC_ROOT_DIR = os.path.join(BASE_DIR, "static")

STATICFILES_DIRS = [
    STATIC_ROOT_DIR
]


AUTH_USER_MODEL = 'authentication.Account'

# Media folders
COMPETITION_DATA = 'data'
COMPETITION_EVALUATION = 'evaluation'
SUBMISSION_FILE= 'submission'
COMPETITION_IMAGE = 'image'
ACCOUNT_AVATAR = 'avatar'
FORUM_ATTACHMENT = 'forum'
SITE_LOGO = 'logo'
SLIDES_MEDIA = 'slides'

# Settings keys
SLIDES_SETTING = 'slides_setting'
TITLE_SETTING = 'title_setting'
DESCRIPTION_SETTING = 'description_setting'
LOGO_SETTING = 'logo_setting'

# Submission settings
NUMBER_ENTRY_PER_DAY = 5
# User can buy a ticket before 50% the end-time is over
CAN_TICKET_BEFORE = 80

# Media URLs
ADMIN_REQUIRED_URLS = [COMPETITION_EVALUATION,]
MEDIA_LOGIN_REQUIRE_URLS = []
MEDIA_DENIED_URLS = [SUBMISSION_FILE, COMPETITION_DATA]

# DRF
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
    # 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    # 'PAGE_SIZE': 10
}

REST_AUTH_SERIALIZERS = {
    'LOGIN_SERIALIZER': 'authentication.serializers.LoginSerializer',
}

REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'authentication.serializers.RegisterSerializer',
}

# JWT
JWT_AUTH = {
    'JWT_ENCODE_HANDLER':
    'rest_framework_jwt.utils.jwt_encode_handler',

    'JWT_DECODE_HANDLER':
    'rest_framework_jwt.utils.jwt_decode_handler',

    'JWT_PAYLOAD_HANDLER':
    # 'rest_framework_jwt.utils.jwt_payload_handler',
    'authentication.payload.jwt_payload_handler',

    'JWT_PAYLOAD_GET_USER_ID_HANDLER':
    'rest_framework_jwt.utils.jwt_get_user_id_from_payload_handler',

    'JWT_RESPONSE_PAYLOAD_HANDLER':
    'rest_framework_jwt.utils.jwt_response_payload_handler',

    'JWT_SECRET_KEY': SECRET_KEY,
    'JWT_ALGORITHM': 'HS256',
    'JWT_VERIFY': True,
    'JWT_VERIFY_EXPIRATION': True,
    'JWT_LEEWAY': 0,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=10),
    'JWT_AUDIENCE': None,
    'JWT_ISSUER': None,

    'JWT_ALLOW_REFRESH': True,
    'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=7),

    'JWT_AUTH_HEADER_PREFIX': 'Bearer',
}

SITE_DOMAIN = 'http://www.hivecon.io'
SITE_DOMAIN2 = 'http://hivecon.io'
LOGIN_URL = '/login/'
COMPETITIONS_URL = '/competitions/'
GALLERY_URL = '/gallery/'
FORUM_URL_REGEX = '%s/c/%s/forums/t/%s'

SITE_ID = 1

# Payment Settings

## PayPal
PP_SANDBOX_FLAG = True
PP_CHECKOUT_URL_SANDBOX = 'https://www.sandbox.paypal.com/checkoutnow?token='
PP_CHECKOUT_URL_LIVE = 'https://www.paypal.com/checkoutnow?token='
PP_NVP_ENDPOINT_SANDBOX = 'https://api-3t.sandbox.paypal.com/nvp'
PP_NVP_ENDPOINT_LIVE = 'https://api-3t.paypal.com/nvp'
# PP_CHECKOUT_URL_SANDBOX = 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token='
# PP_CHECKOUT_URL_LIVE = 'https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token='
PP_API_VERSION = '204'
#Seller Sandbox Credentials
PP_USER_SANDBOX = 'enterpriselab.test-business_api1.gmail.com'
PP_PASSWORD_SANDBOX = 'FSRTFERY7UURPCP9'
PP_SIGNATURE_SANDBOX = 'AFcWxV21C7fd0v3bYYYRCpSSRl31AWUeksQdvCXsSIxAdO1WnC80Sp6o'
#Seller Live credentials.
PP_USER = "enterpriselab.test_api1.gmail.com"
PP_PASSWORD = "EDXM7CVKNM967YEV"
PP_SIGNATURE = "AFcWxV21C7fd0v3bYYYRCpSSRl31ABRZbMqeBe-YBSeVkbnnMC2O-UBw"
# Ticket amount (USD)
PP_TICKET_AMOUNT = 5

## Stripe
ST_TEST_FLAG = True
PAY_WITH_STRIPE = False
# Test
ST_TEST_SECRET_KEY = 'sk_test_JrbCFs1PoliyFyCJZ83i6L1z'
ST_TEST_PUBLISHABLE_KEY = 'pk_test_0UwdQAGEWMJQ9RFzeCqycEEs'
# Live
ST_LIVE_SECRET_KEY = 'sk_live_p6JgEFCSAHwI3na1UGpBrSyi'
ST_LIVE_PUBLISHABLE_KEY = 'pk_live_4oqyqFKtOuRdLR2vAB8KDgxK'
# Ticket amount (cents)
ST_TICKET_AMOUNT = 500


## Social Settings

FB_APP_TEST = False
# Facebook
FB_APP_ID = '266303860451156'
FB_APP_ID_TEST = '911293972335006'

# Google
GG_APP_ID = '656072585875-47ebk9e2aoe7cfhc7soiebd1grk0ki35.apps.googleusercontent.com'
GG_APP_SECRET = 'Z4fDWTOcVidcB20EldAGYlPv'


## Email for notification
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'enterpriselab.test'
EMAIL_HOST_PASSWORD = 'vStation123'


## App all-auth settings
ACCOUNT_ADAPTER="authentication.adapter.DefaultAccountAdapterCustom"
ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS = True
LOGIN_REDIRECT_URL = '/'
REST_USE_JWT = True
#allow logout using GET
ACCOUNT_LOGOUT_ON_GET = True
# to use old_password when change password
OLD_PASSWORD_FIELD_ENABLED = True
#keep the user logged in after password change
LOGOUT_ON_PASSWORD_CHANGE = False
# EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
# 'mandatory' the user is blocked from logging in until the email address is verified.
# Choose 'optional' or 'none' to allow logins with an unverified e-mail address.
# In case of 'optional', the e-mail verification mail is still sent,
# whereas in case of 'none' no e-mail verification mails are sent.
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
#The URL to redirect to after a successful e-mail confirmation, in case no user is logged in.
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/login'
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = '/register/confirm'
# Determines whether or not an e-mail address is automatically confirmed by a GET request
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
# Determines the expiration date of email confirmation mails (# of days).
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3


## Disqus settings

DISQUS_SHORTNAME = 'hivecon'
DISQUS_PUBLIC_KEY = 'KkmkRwE0c8ajki2pGFkoXyMFLUsuhF3bookkdGvkUO0ozFctfYTu8InluTW3hnXm'
DISQUS_SECRET_KEY = 'tsg0MnHGOH1nc8yOfhAZ6YEZzGp4JzlMJuHRG0c3w7gk5hfkt52u7PiFA6ACw7yL'
