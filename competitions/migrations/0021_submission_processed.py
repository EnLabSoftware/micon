# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-12-06 10:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0020_leaderboard'),
    ]

    operations = [
        migrations.AddField(
            model_name='submission',
            name='processed',
            field=models.BooleanField(default=False),
        ),
    ]
