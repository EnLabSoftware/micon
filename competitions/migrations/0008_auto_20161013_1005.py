# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-13 10:05
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0007_auto_20161012_0230'),
    ]

    operations = [
        migrations.AlterField(
            model_name='competition',
            name='short_title',
            field=models.CharField(max_length=250),
        ),
        migrations.AlterField(
            model_name='competition',
            name='title',
            field=models.CharField(max_length=250),
        ),
    ]
