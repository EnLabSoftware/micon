from django import template
import urlparse
import urllib

register = template.Library()


@register.simple_tag
def update_querystring(qs, *args, **kwargs):

    qs_d = dict(urlparse.parse_qsl(qs))

    qs_d.update(kwargs)

    return urllib.urlencode(qs_d)
