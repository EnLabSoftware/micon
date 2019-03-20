import re

from django.views.static import serve as django_serve
from django.conf import settings
from django.conf.urls import url
from .views import MediaView


urlpatterns = [
    url(
        r'^%s(?P<type>\w+)/(?P<path>.*)$' % re.escape(settings.MEDIA_URL.lstrip('/')),
        MediaView.as_view(),
        name='media_view'
    ),
    url(
        r'^%s(?P<path>.*)$' % re.escape(settings.STATIC_URL.lstrip('/')),
        django_serve, { 'document_root': settings.STATIC_ROOT_DIR },
        name='static_view'
    ),
]
