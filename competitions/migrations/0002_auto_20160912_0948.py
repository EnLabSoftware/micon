# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-09-12 09:48
from __future__ import unicode_literals

import competitions.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='competition',
            name='image',
            field=models.ImageField(null=True, upload_to=competitions.models.generate_image_upload_path),
        ),
        migrations.AlterField(
            model_name='competition',
            name='logo',
            field=models.ImageField(null=True, upload_to=competitions.models.generate_image_upload_path),
        ),
    ]