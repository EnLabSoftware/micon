# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-21 09:32
from __future__ import unicode_literals

import authentication.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='avatar',
            field=models.ImageField(null=True, upload_to=authentication.models.generate_avatar_upload_path),
        ),
        migrations.AddField(
            model_name='account',
            name='birth_day',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='account',
            name='gender',
            field=models.IntegerField(choices=[(0, b'Male'), (1, b'Female')], default=0),
        ),
        migrations.AddField(
            model_name='account',
            name='phone_number',
            field=models.CharField(max_length=15, null=True),
        ),
    ]
