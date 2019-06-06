# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-12-19 03:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0025_forumtopic'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumtopic',
            name='approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='forumtopic',
            name='closed',
            field=models.BooleanField(default=False),
        ),
    ]