# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-12-27 10:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('competitions', '0028_forumtopic_updated'),
    ]

    operations = [
        migrations.AddField(
            model_name='evaluationcode',
            name='message_log',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]
