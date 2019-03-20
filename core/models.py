from __future__ import unicode_literals
from picklefield import PickledObjectField
from django.db import models


class FrontSetting(models.Model):
    key = models.CharField(max_length=50)
    value = PickledObjectField(editable=False)

    def update_setting(self, data):
        self.value = data
        self.save()