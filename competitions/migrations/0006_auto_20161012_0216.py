# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-12 02:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0005_auto_20161010_1100'),
    ]

    operations = [
        migrations.AlterField(
            model_name='competition',
            name='short_description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
