import os

from django.conf import settings
from django.core.files import File
from django_downloadview.exceptions import FileNotFound
from django_downloadview.views.path import PathDownloadView


class MediaView(PathDownloadView):

    def get_file(self):
        type = self.kwargs.get('type')
        path = self.kwargs.get('path')
        file = '%s/%s' % (type, path)
        full_path = '%s/%s' % (settings.MEDIA_ROOT, file)
        if not os.path.isfile(full_path):
            raise FileNotFound('File "{0}" does not exists'.format(file))
        return File(file=open(full_path, 'rb'))
