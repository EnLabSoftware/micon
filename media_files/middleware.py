import re

from django.conf import settings
from django.contrib.auth.views import redirect_to_login
from django.http import Http404
from django.shortcuts import redirect


class MediaLoginRequiredMiddleware:
    def process_request(self, request):
        path = request.path

        if not request.user.is_authenticated() \
            and any(m.match(path) for m in [
                re.compile('%s%s' % (settings.MEDIA_URL, expr)) for expr in settings.MEDIA_LOGIN_REQUIRE_URLS]):
                return redirect_to_login(path)


class MediaDeniedMiddleware:
    def process_request(self, request):
        path = request.path

        if any(m.match(path) for m in [
            re.compile('%s%s' % (settings.MEDIA_URL, expr)) for expr in settings.MEDIA_DENIED_URLS]):
                raise Http404


class AdminRequiredMiddleware:
    def process_request(self, request):
        path = request.path

        if not request.user.is_superuser and any(m.match(path) for m in [
            re.compile('%s%s' % (settings.MEDIA_URL, expr)) for expr in settings.ADMIN_REQUIRED_URLS]):
                raise Http404
