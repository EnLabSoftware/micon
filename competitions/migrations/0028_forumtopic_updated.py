# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-12-20 05:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0027_topicattachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumtopic',
            name='updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
