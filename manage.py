#!/usr/bin/env python
import os
from os.path import join, dirname, abspath, exists
import sys

if __name__ == "__main__":
    root = dirname(abspath(__file__))
    sys.path.append(root)
    settings_module = None
    for name in os.listdir(root):
        full_name = join(root, name)
        if exists(join(full_name, 'settings', '__init__.py')):
                settings_module = name + '.settings'
                break

    if settings_module is not None:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        try:
            import django
        except ImportError:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )
        raise
    execute_from_command_line(sys.argv)