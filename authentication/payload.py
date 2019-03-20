import uuid
import warnings
from calendar import timegm
from datetime import datetime

from rest_framework_jwt.compat import get_username, get_username_field
from rest_framework_jwt.settings import api_settings


def jwt_payload_handler(user):
    username_field = get_username_field()
    username = get_username(user)

    warnings.warn(
        'The following fields will be removed in the future: '
        '`email` and `user_id`. ',
        DeprecationWarning
    )

    payload = {
        'user_id': user.pk,
        'email': user.email,
        'username': username,
        'display_name': user.display_name,
        'first_name': user.first_name,
        'phone_number': user.phone_number,
        'gender': user.gender,
        'birth_day': user.birth_day.strftime('%Y-%m-%d') if user.birth_day else '',
        'last_name': user.last_name,
        'avatar': user.avatar.url if user.avatar else '',
        'is_staff': user.is_staff,
        'is_social': True if user.socialaccount_set.values() else False,
        'exp': datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
    }
    if isinstance(user.pk, uuid.UUID):
        payload['user_id'] = str(user.pk)

    payload[username_field] = username

    # Include original issued at time for a brand new token,
    # to allow token refresh
    if api_settings.JWT_ALLOW_REFRESH:
        payload['orig_iat'] = timegm(
            datetime.utcnow().utctimetuple()
        )

    if api_settings.JWT_AUDIENCE is not None:
        payload['aud'] = api_settings.JWT_AUDIENCE

    if api_settings.JWT_ISSUER is not None:
        payload['iss'] = api_settings.JWT_ISSUER

    return payload
