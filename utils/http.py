import os
from django.http import HttpResponse
from cStringIO import StringIO
from zipfile import ZipFile

import decimal
import json


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(CustomJSONEncoder, self).default(o)


def json_response(data, status=200):
    return HttpResponse(json.dumps(data, cls=CustomJSONEncoder),
        content_type='application/json', status=status)


def zipfile_response(file_path, file_name):
    in_memory = StringIO()
    zip = ZipFile(in_memory, "a")
    with open(file_path) as f:
        content = f.read()
    zip.writestr(os.path.basename(file_path), content)

    # fix for Linux zip files read in Windows
    for file in zip.filelist:
        file.create_system = 0

    zip.close()

    response = HttpResponse(content_type="application/zip")
    response["Content-Disposition"] = "attachment; filename=%s.zip" % file_name

    in_memory.seek(0)
    response.write(in_memory.read())

    return response


def is_url(name):
    """Returns true if the name looks like a URL"""
    if ':' not in name:
        return False
    scheme = name.split(':', 1)[0].lower()
    return scheme in ['http', 'https', 'file', 'ftp']
