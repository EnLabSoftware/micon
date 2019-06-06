# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-12-07 06:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0022_auto_20161207_0652'),
    ]

    operations = [
        migrations.AlterField(
            model_name='competition',
            name='status',
            field=models.IntegerField(choices=[(1, b'Inactivate'), (4, b'Incoming'), (2, b'Activate'), (3, b'Finished')], default=1),
        ),
    ]