# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-10-18 08:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0010_auto_20161013_1015'),
    ]

    operations = [
        migrations.AddField(
            model_name='competition',
            name='type',
            field=models.IntegerField(blank=True, choices=[(1, b'Supervised'), (2, b'Unsupervised'), (3, b'Reinforcement Learning')], null=True),
        ),
        migrations.AlterField(
            model_name='competition',
            name='status',
            field=models.IntegerField(choices=[(1, b'Inactivate'), (2, b'Activate'), (3, b'Finished')], default=1),
        ),
    ]
