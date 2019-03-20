from rest_framework import serializers
from core.models import FrontSetting


class SlidesSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrontSetting
        fields = ('key', 'value')