# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-27 11:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_auto_20161021_0932'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]