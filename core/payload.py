import base64
import hashlib
import hmac
import simplejson
import time
from calendar import timegm
from datetime import datetime
from django.conf import settings
from rest_framework_jwt.settings import api_settings
from core.models import FrontSetting


def get_disqus_sso(user):
    if user.is_authenticated:
        user_data = {
            'id': user.id,
            'username': user.display_name or user.username,
            'email': user.email,
            'avatar': '%(site_domain)s/%(avatar_url)s' % {
                'site_domain': settings.SITE_DOMAIN,
                'avatar_url': user.avatar.url if user.avatar else ''
            },
        }
    else:
        user_data = {}
    data = simplejson.dumps(user_data)
    message = base64.b64encode(data)
    timestamp = int(time.time())
    sig = hmac.HMAC(settings.DISQUS_SECRET_KEY, '%s %s' % (message, timestamp), hashlib.sha1).hexdigest()

    return '%s %s %s' % (message, sig, timestamp)


def site_settings_payload(user):
    payload = {
        'PAYPAL_SANDBOX': settings.PP_SANDBOX_FLAG,
        'STRIPE_PUBLISHABLE_KEY': settings.ST_TEST_PUBLISHABLE_KEY if settings.ST_TEST_FLAG else settings.ST_LIVE_PUBLISHABLE_KEY,
        'STRIPE_TICKET_AMOUNT': settings.ST_TICKET_AMOUNT,
        'FB_APP_ID': settings.FB_APP_ID_TEST if settings.FB_APP_TEST else settings.FB_APP_ID,
        'GG_APP_ID': settings.GG_APP_ID,
        'DISQUS_SHORTNAME': settings.DISQUS_SHORTNAME,
        'DISQUS_PUBLIC_KEY': settings.DISQUS_PUBLIC_KEY,
        'DISQUS_SSO': get_disqus_sso(user),
        'PAY_WITH_STRIPE': settings.PAY_WITH_STRIPE,
        'SITE_TITLE': FrontSetting.objects.get(key=settings.TITLE_SETTING).value,
        'SITE_LOGO': FrontSetting.objects.get(key=settings.LOGO_SETTING).value,
        'SITE_DESCRIPTION': FrontSetting.objects.get(key=settings.DESCRIPTION_SETTING).value
    }

    # Include original issued at time for a brand new token,
    # to allow token refresh
    if api_settings.JWT_ALLOW_REFRESH:
        payload['orig_iat'] = timegm(
            datetime.utcnow().utctimetuple()
        )

    return payload
