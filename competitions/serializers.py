from datetime import datetime
from disqusapi import DisqusAPI
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from rest_framework import serializers
from rest_framework.generics import get_object_or_404
from rest_framework.reverse import reverse

from utils.file.tools import slugify_file_name
from utils.http import is_url
from .models import Competition, CompetitionData, Submission, EvaluationCode, \
    Ticket, Prize, ForumTopic


class CustomImageField(serializers.ImageField):

    def __init__(self, *args, **kwargs):
        super(CustomImageField, self).__init__(*args, **kwargs)

    def to_internal_value(self, data):
        if is_url(data):
            try:
                path = data.split(settings.MEDIA_URL)[1]
                data_file = open('%s/%s' % (settings.MEDIA_ROOT, path), 'rb')
                data = ContentFile(data_file.read(), data_file.name)
            except Exception as e:
                pass
        elif isinstance(data, InMemoryUploadedFile):
            data.seek(0)
        else:
            return None

        return super(CustomImageField, self).to_internal_value(data)


class CompetitionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Competition
        fields = ('id', 'title', 'slug', 'short_description', 'logo', 'start_time',
                  'end_time', 'status_name', 'entries', 'players', 'total_prizes',)
        extra_kwargs = {
            'url': {'lookup_field': 'slug'},
        }
        read_only_fields = ['slug']


class CompetitionDetailSerializer(serializers.HyperlinkedModelSerializer):
    logo = CustomImageField(use_url=True, max_length=None)
    image = CustomImageField(use_url=True, max_length=None)
    can_entries = serializers.SerializerMethodField(read_only=True)
    ticketed = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Competition
        fields = ('id', 'title', 'slug', 'description', 'short_description', 'logo', 'image', 'time_progress',
                  'start_time', 'end_time', 'status', 'type', 'is_activate', 'is_incoming', 'entries', 'players',
                  'total_prizes', 'can_entries', 'ticketed', 'can_ticket', 'ticket_dieline', 'can_submission',)
        extra_kwargs = {
            'url': {'lookup_field': 'slug'},
        }
        read_only_fields = ['slug']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({"validate": "Finish must occur after start.", 'error': True})
        if data['status'] == Competition.STATUS_ACTIVATE and self._args and self._args[0].data_files.all().count() == 0:
            raise serializers.ValidationError(
                {"validate": "The competition with no data cannot be set to active. Please adding data before.",
                 'error': False})
        return data

    def get_can_entries(self, obj):
        return obj.can_entries_today(self.context.get('request').user)

    def get_ticketed(self, obj):
        return obj.check_ticketed(self.context.get('request').user)

    def update(self, instance, validated_data):
        if instance.logo and validated_data['logo'] and \
            instance.logo.file.read() == validated_data['logo'].read():
            del validated_data['logo']
        if instance.image and validated_data['image'] and \
            instance.image.file.read() == validated_data['image'].read():
            del validated_data['image']
        return super(CompetitionDetailSerializer, self).update(instance, validated_data)


class CompetitionDataSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CompetitionData
        lookup_field = 'name'
        fields = ('id', 'url', 'name', 'attachment', 'description', 'format', 'size', 'type', 'type_name')
        read_only_fields = ['name']
        extra_kwargs = {
            'attachment': {'write_only': True},
        }

    def get_url(self, obj):
        return reverse(
            'competition-data-download',
            kwargs={'competition_slug': obj.competition.slug, 'name': obj.name},
            request=self.context.get('request')
        )

    def create(self, validated_data):
        competition = get_object_or_404(Competition, slug=validated_data.get('competition_slug'))
        return CompetitionData.objects.create(
            competition=competition,
            name=slugify_file_name(validated_data.get('attachment').name),
            attachment=validated_data.get('attachment'),
            description=validated_data.get('description', ''),
            type=validated_data.get('type')
        )


class CompetitionDataSerializerForUpdate(CompetitionDataSerializer):
    class Meta:
        model = CompetitionData
        fields = ('description', 'type')


class PrizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prize
        fields = ('id', 'name', 'money', 'place', 'description')
        read_only_fields = ['uploaded']

    def validate(self, data):
        money = data['money']
        if money < 0:
            raise serializers.ValidationError({"error": "Money must be a positive number"})
        if money > pow(10, 6):
            raise serializers.ValidationError({"error": "The prize is limited to $1,000,000"})
        return data

    def create(self, validated_data):
        competition = get_object_or_404(Competition, slug=validated_data.get('competition_slug'))
        return Prize.objects.create(
            competition=competition,
            money=validated_data.get('money'),
            place=validated_data.get('place'),
            description=validated_data.get('description', ''),
        )


class PrizeSerializerForUpdate(PrizeSerializer):
    class Meta:
        model = Prize
        fields = ('money', 'place', 'description')


class SubmissionSerializer(serializers.ModelSerializer):
    competition = serializers.SerializerMethodField(read_only=True)
    competition_slug = serializers.SerializerMethodField(read_only=True)
    author = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Submission
        fields = (
        'uid', 'name', 'file', 'url', 'processed', 'is_valid', 'score', 'description', 'message_log', 'author',
        'competition', 'competition_slug', 'uploaded')
        extra_kwargs = {
            'file': {'write_only': True},
        }
        read_only_fields = ['uploaded', 'name', 'uid']

    def get_url(self, obj):
        return reverse(
            'submission-download',
            kwargs={'competition_slug': obj.competition.slug, 'uid': obj.uid, 'name': obj.uid},
            request=self.context.get('request')
        )

    def get_author(self, obj):
        return obj.user.username

    def get_competition(self, obj):
        return obj.competition.title

    def get_competition_slug(self, obj):
        return obj.competition.slug

    def create(self, validated_data):
        competition = get_object_or_404(Competition, slug=validated_data.get('competition_slug'))
        return Submission.objects.create(
            competition=competition,
            user=self.context.get('request').user,
            name=slugify_file_name(validated_data.get('file').name),
            file=validated_data.get('file'),
            description=validated_data.get('description', ''),
        )


class SubmissionSerializerForUpdate(SubmissionSerializer):
    class Meta:
        model = Submission
        fields = ('description',)


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCode
        fields = (
        'id', 'name', 'file', 'evaluation_func', 'validation_func', 'description', 'active', 'uploaded', 'message_log')
        read_only_fields = ['uploaded', 'name']

    def create(self, validated_data):
        competition = get_object_or_404(Competition, slug=validated_data.get('competition_slug'))
        return EvaluationCode.objects.create(
            competition=competition,
            name=slugify_file_name(validated_data.get('file').name),
            file=validated_data.get('file'),
            evaluation_func=validated_data.get('evaluation_func'),
            validation_func=validated_data.get('validation_func'),
            active=validated_data.get('active'),
            description=validated_data.get('description', ''),
        )


class TicketSerializer(serializers.ModelSerializer):
    buyer = serializers.SerializerMethodField(read_only=True)
    competition = serializers.SerializerMethodField(read_only=True)
    competition_slug = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Ticket
        fields = ('id', 'payment_method', 'paymentID', 'payment_status', 'message_log',
                  'buyer', 'competition', 'competition_slug', 'created')
        read_only_fields = ['created']

    def get_buyer(self, obj):
        return obj.user.username

    def get_competition(self, obj):
        return obj.competition.title

    def get_competition_slug(self, obj):
        return obj.competition.slug


class EvaluationSerializerForUpdate(SubmissionSerializer):
    class Meta:
        model = EvaluationCode
        fields = ('evaluation_func', 'validation_func', 'active', 'description')


class ForumTopicSerializer(serializers.ModelSerializer):
    competition = serializers.SerializerMethodField(read_only=True)
    competition_slug = serializers.SerializerMethodField(read_only=True)
    author_name = serializers.SerializerMethodField(read_only=True)
    author_display = serializers.SerializerMethodField(read_only=True)
    attachments = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ForumTopic
        fields = ('id', 'title', 'slug', 'content', 'author_name', 'author_display', 'attachments', 'competition',
                  'competition_slug', 'created')
        read_only_fields = ['created', 'slug']

    def get_competition(self, obj):
        return obj.competition.title

    def get_competition_slug(self, obj):
        return obj.competition.slug

    def get_attachments(self, obj):
        at = []
        attachments = obj.attachments.all()
        for attachment in attachments:
            at.append({
                'name': attachment.name,
                'size': attachment.file.size,
                'url': reverse(
                    'forum-attachment-download',
                    kwargs={
                        'competition_slug': obj.competition.slug,
                        'topic_slug': obj.slug,
                        'name': attachment.name
                    },
                    request=self.context.get('request')
                )
            })
        return at

    def get_author_name(self, obj):
        return obj.user.username

    def get_author_display(self, obj):
        return obj.user.display_name or obj.user.username

    def create(self, validated_data):
        competition = get_object_or_404(Competition, slug=validated_data.get('competition_slug'))
        return ForumTopic.objects.create(
            competition=competition,
            user=self.context.get('request').user,
            title=validated_data.get('title'),
            approved=True,
            content=validated_data.get('content', ''),
        )


class ForumTopicListSerializer(ForumTopicSerializer):
    replies = serializers.SerializerMethodField(read_only=True)
    votes = serializers.SerializerMethodField(read_only=True)
    last_post_id = serializers.SerializerMethodField(read_only=True)
    last_post_at = serializers.SerializerMethodField(read_only=True)
    last_author = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ForumTopic
        fields = ('id', 'title', 'slug', 'content', 'author_name', 'author_display', 'created',
                  'votes', 'replies', 'last_post_id', 'last_post_at', 'last_author')
        read_only_fields = ['created', 'slug']

    def to_representation(self, instance):
        try:
            DISQUS = DisqusAPI(settings.DISQUS_SECRET_KEY, settings.DISQUS_PUBLIC_KEY)
            thread = 'link:%s' % settings.FORUM_URL_REGEX % (
            settings.SITE_DOMAIN, instance.competition.slug, instance.slug)
            instance.disqus_posts = DISQUS.threads.listPosts(
                method='GET',
                forum=settings.DISQUS_SHORTNAME,
                thread=thread,
                limit=1
            )
            instance.disqus_details = DISQUS.threads.details(
                method='GET',
                forum=settings.DISQUS_SHORTNAME,
                thread=thread
            )
        except Exception as e:
            instance.disqus_posts = {}
            instance.disqus_details = {}
        return super(ForumTopicListSerializer, self).to_representation(instance)

    def get_replies(self, obj):
        try:
            return obj.disqus_details['posts']
        except Exception as e:
            pass
        return 0

    def get_votes(self, obj):
        try:
            return obj.disqus_details['likes']
        except Exception as e:
            pass
        return 0

    def get_last_post_at(self, obj):
        try:
            return '%s.000000Z' % obj.disqus_posts[0]['createdAt']
        except Exception as e:
            pass
        return ''

    def get_last_post_id(self, obj):
        try:
            return obj.disqus_posts[0]['id']
        except Exception as e:
            pass
        return ''

    def get_last_author(self, obj):
        try:
            return obj.disqus_posts[0]['author']['name']
        except Exception as e:
            pass
        return ''
