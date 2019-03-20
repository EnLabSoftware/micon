import re
from datetime import datetime
from django.conf import settings

from uuid import uuid4
import os
import unicodedata

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils import formats
from django.utils.encoding import force_text
from django.utils.safestring import mark_safe
from django.utils.translation import ungettext, ugettext
from cStringIO import StringIO
from zipfile import ZipFile
import smtplib
from django.template.loader import render_to_string
from email.message import Message


def generate_upload_path(fname, media_rel_path, auto_create=True):
    """Generates upload path for files.

    Used as a callable object argument for FileField upload_to argument.
    """
    base, ext = os.path.splitext(fname)
    base = "%s%s" % (uuid4().hex, datetime.now().strftime("%Y%m%d%H%M%S"))
    dname = os.path.join(media_rel_path,
        base[0:2], base[2:4], base[4:6])
    if fname:
        fpath = os.path.join(dname, base + ext[:10])
    else:
        dname = os.path.join(dname, base)
        fpath = dname
    if auto_create:
        os.makedirs(os.path.join(settings.MEDIA_ROOT, dname))
    return fpath


def file_exists(filepath):
    if default_storage.exists(filepath):
        return True
    return False


def remove_file(filepath, delete_dirs=True):
    try:
        if (file_exists(filepath)):
            os.remove(filepath)
        if delete_dirs and os.path.exists(os.path.dirname(filepath)):
            os.removedirs(os.path.dirname(filepath))
        return True
    except Exception:
        return False


def slugify_file_name(value):
    value = force_text(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub('[^.\w\s-]', '', value).strip()
    return mark_safe(re.sub('[-\s]+', '_', value))


def filesizeformat(bytes_):
    """
    Formats the value like a 'human-readable' file size (i.e. 13 KB, 4.1 MB,
    102 bytes, etc.).
    """
    try:
        bytes_ = float(bytes_)
    except (TypeError, ValueError, UnicodeDecodeError):
        value = ungettext("%(size)d byte", "%(size)d bytes", 0) % {'size': 0}
        return value

    def filesize_number_format(value):
        return formats.number_format(round(value, 1), 1)

    KB = 1 << 10
    MB = 1 << 20
    GB = 1 << 30
    TB = 1 << 40
    PB = 1 << 50

    negative = bytes_ < 0
    if negative:
        bytes_ = -bytes_  # Allow formatting of negative numbers.

    if bytes_ < KB:
        value = ungettext("%(size)d byte", "%(size)d bytes", bytes_) % {'size': bytes_}
    elif bytes_ < MB:
        value = ugettext("%s KB") % filesize_number_format(bytes_ / KB)
    elif bytes_ < GB:
        value = ugettext("%s MB") % filesize_number_format(bytes_ / MB)
    elif bytes_ < TB:
        value = ugettext("%s GB") % filesize_number_format(bytes_ / GB)
    elif bytes_ < PB:
        value = ugettext("%s TB") % filesize_number_format(bytes_ / TB)
    else:
        value = ugettext("%s PB") % filesize_number_format(bytes_ / PB)

    if negative:
        value = "-%s" % value
    return value


def get_zip_from_path(file_path, file_name, output_name):
    in_memory = StringIO()
    zip = ZipFile(in_memory, "a")
    content_name = '%s.zip' % output_name
    with open(file_path) as f:
        content = f.read()
    zip.writestr(file_name, content)
    # fix for Linux zip files read in Windows
    for file in zip.filelist:
        file.create_system = 0
    zip.close()
    in_memory.seek(0)
    file = ContentFile(content=in_memory.read(), name=content_name)

    return file

def sending_email(to_email):
    msg = Message()
    msg['Subject'] = "Registration Successful"
    msg['From'] = settings.EMAIL_HOST_USER
    msg['To'] = to_email
    msg.add_header('Content-Type','text/html')
    body = render_to_string('account/email/email_notify_signup_success.html', {
        'site':'Micon',
        'site_url': settings.SITE_DOMAIN,
        'competition_url': settings.SITE_DOMAIN + settings.COMPETITIONS_URL,
        'gallery_url': settings.SITE_DOMAIN + settings.GALLERY_URL
    })
    msg.set_payload(body)

    s = smtplib.SMTP('smtp.gmail.com')
    s.starttls()
    s.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
    s.sendmail(msg['From'], [msg['To']], msg.as_string())