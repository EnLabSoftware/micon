# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-26 04:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0014_submission'),
    ]

    operations = [
        migrations.AddField(
            model_name='submission',
            name='uid',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
    ]