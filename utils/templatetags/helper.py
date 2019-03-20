import json
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter('cls')
def cls(o):
    return o.__class__.__name__

@register.filter(name='json')
def json_dumps(data):
    return mark_safe(json.dumps(data))

@register.filter(name='lookup')
def get_item(dictionary, key):
    return dictionary.get(key)
