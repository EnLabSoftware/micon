# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-10 11:00
from __future__ import unicode_literals

import competitions.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0004_competitiondata_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='competition',
            name='logo',
            field=models.ImageField(upload_to=competitions.models.generate_image_upload_path),
        ),
        migrations.AlterField(
            model_name='competition',
            name='image',
            field=models.ImageField(upload_to=competitions.models.generate_image_upload_path),
        ),
    ]
