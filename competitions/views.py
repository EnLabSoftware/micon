import os

from django.conf import settings
from django.core.files import File
from django.shortcuts import get_object_or_404
from django_downloadview.exceptions import FileNotFound
from django_downloadview.views.path import PathDownloadView

from rest_framework import permissions as rest_permissions, viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import list_route, detail_route

from utils.file.tools import slugify_file_name, get_zip_from_path
from utils.shortcuts import get_or_none
from .models import Competition, CompetitionData, Submission, EvaluationCode,\
    Leaderboard, Prize, ForumTopic, TopicAttachment

import paginations
import serializers
import permissions


class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all().order_by('-id')
    lookup_field = 'slug'
    permission_classes_by_action = {
        'retrieve': [permissions.CanUserViewCompetitionDetail],
        'activate': [rest_permissions.AllowAny],
        'gallery': [rest_permissions.AllowAny],
        'available': [rest_permissions.AllowAny],
        'incoming': [rest_permissions.AllowAny],
        'entered': [rest_permissions.IsAuthenticated],
        'default': [rest_permissions.IsAdminUser]
    }
    serializer_classes_by_action = {
        'list':  serializers.CompetitionSerializer,
        'activate':  serializers.CompetitionSerializer,
        'gallery':  serializers.CompetitionSerializer,
        'available':  serializers.CompetitionSerializer,
        'incoming': serializers.CompetitionSerializer,
        'entered': serializers.CompetitionSerializer,
        'default': serializers.CompetitionDetailSerializer,
    }
    pagination_class = paginations.CompetitionPagination

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        try:
            return self.serializer_classes_by_action[self.action]
        except (KeyError, AttributeError):
            return self.serializer_classes_by_action['default']

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permission() for permission in self.permission_classes_by_action['default']]

    @list_route(url_path='available')
    def available(self, request, *args, **kwargs):

        # way1
        # queryset = Competition.objects.filter(
        #     status__in=[Competition.STATUS_ACTIVATE, Competition.STATUS_FINISHED, Competition.STATUS_INCOMING],data_files__isnull=False
        # ).order_by('-id').distinct()

        # way2
        # queryset = Competition.objects.filter(
        #     status__in=[Competition.STATUS_ACTIVATE, Competition.STATUS_FINISHED, Competition.STATUS_INCOMING]
        # ).order_by('-id').exclude(data_files=None)

        queryset = Competition.objects.filter(
            status__in=[Competition.STATUS_ACTIVATE, Competition.STATUS_FINISHED, Competition.STATUS_INCOMING]
        ).order_by('-id')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer_class()(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @list_route(url_path='incoming')
    def incoming(self, request, *args, **kwargs):
        queryset = Competition.objects.filter(status=Competition.STATUS_INCOMING).order_by('-id')
        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @list_route(url_path='activate')
    def activate(self, request, *args, **kwargs):
        queryset = Competition.objects.filter(status=Competition.STATUS_ACTIVATE).order_by('-id')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer_class()(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @list_route(url_path='entered')
    def entered(self, request, *args, **kwargs):
        queryset = Competition.objects.filter(
            id__in=Submission.objects.filter(user=request.user).values('competition').distinct()
        ).order_by('-id')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer_class()(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @list_route(url_path='gallery')
    def gallery(self, request, *args, **kwargs):
        queryset = Competition.objects.filter(status=Competition.STATUS_FINISHED).order_by('-end_time')

        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class CompetitionDataViewSet(viewsets.ModelViewSet):
    lookup_field = 'name'
    lookup_value_regex = '.*'
    serializer_class_by_action = {
        'update': serializers.CompetitionDataSerializerForUpdate,
        'default': serializers.CompetitionDataSerializer
    }
    permission_classes_by_action = {
        'learning_data': [permissions.CanUserViewTrainingDataList],
        'retrieve': [permissions.CanUserViewCompetitionDataDetail],
        'default': [rest_permissions.IsAdminUser]
    }

    def get_queryset(self):
        return CompetitionData.objects.filter(competition__slug=self.kwargs.get('competition_slug'))

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permission() for permission in self.permission_classes_by_action['default']]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        if serializer.is_valid():
            try:
                if CompetitionData.objects.filter(
                    competition__slug=self.kwargs.get('competition_slug'),
                    name=slugify_file_name(serializer.validated_data.get('attachment').name)
                ).exists():
                    return Response({
                        'error': 'This data file already exists.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                serializer.save(**kwargs)
                return Response({'success': True}, status=status.HTTP_201_CREATED)
            except Exception as e:
                pass

        return Response({
            'error': 'Competition data could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)

    @list_route(url_path='learning')
    def learning_data(self, request, *args, **kwargs):
        queryset = CompetitionData.objects.get_learning_data_by_slug(self.kwargs.get('competition_slug'))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer_class()(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer_class()(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class PrizeViewSet(viewsets.ModelViewSet):
    serializer_class_by_action = {
        'update': serializers.PrizeSerializerForUpdate,
        'default': serializers.PrizeSerializer
    }
    permission_classes_by_action = {
        'list': [rest_permissions.AllowAny],
        'retrieve': [rest_permissions.AllowAny],
        'default': [rest_permissions.IsAdminUser]
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permission() for permission in self.permission_classes_by_action['default']]

    def get_queryset(self):
        return Prize.objects.filter(
            competition__slug=self.kwargs.get('competition_slug')
        ).order_by('place')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        try:
            if Prize.objects.filter(
                competition__slug=self.kwargs.get('competition_slug'),
                place=serializer.validated_data.get('place')
            ).exists():
                return Response({
                    'error': 'This prize already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(**kwargs)
            return Response({'success': True}, status=status.HTTP_201_CREATED)
        except Exception as e:
            pass

        return Response({
            'error': 'Prize could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


class ForumTopicViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    # pagination_class = paginations.CompetitionForumPagination
    serializer_class_by_action = {
        'list': serializers.ForumTopicListSerializer,
        'default': serializers.ForumTopicSerializer
    }
    permission_classes_by_action = {
        'list': [rest_permissions.AllowAny],
        'create': [rest_permissions.IsAuthenticated],
        'retrieve': [rest_permissions.AllowAny],
        'default': [rest_permissions.IsAdminUser]
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permission() for permission in self.permission_classes_by_action['default']]

    def get_queryset(self):
        return ForumTopic.objects.filter(
            approved=True,
            competition__slug=self.kwargs.get('competition_slug')
        ).order_by('-id')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        topic = None
        if serializer.is_valid():
            try:
                topic = serializer.save(**kwargs)
                attachments = request.FILES.getlist('attachments', [])
                if attachments:
                    for attachment in attachments:
                        at = TopicAttachment.objects.create(
                            topic=topic,
                            name=attachment.name,
                            file=attachment
                        )
                return Response({
                    'success': True,
                    'topic_slug': topic.slug,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                if topic:
                    topic.delete()

        return Response({
            'error': 'Topic could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminForumTopicViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    queryset = ForumTopic.objects.all().order_by('-id')
    permission_classes = [rest_permissions.IsAdminUser]
    serializer_class_by_action = {
        'default': serializers.ForumTopicSerializer
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']


class AdminSubmissionViewSet(viewsets.ModelViewSet):
    lookup_field = 'uid'
    queryset = Submission.objects.all().order_by('-id')
    permission_classes = [rest_permissions.IsAdminUser]
    serializer_class_by_action = {
        'update': serializers.SubmissionSerializerForUpdate,
        'default': serializers.SubmissionSerializer
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']


class SubmissionViewSet(viewsets.ModelViewSet):
    lookup_field = 'uid'
    serializer_class_by_action = {
        'update': serializers.SubmissionSerializerForUpdate,
        'default': serializers.SubmissionSerializer
    }
    permission_classes_by_action = {
        'destroy': [rest_permissions.IsAdminUser],
        'default': [rest_permissions.IsAuthenticated, permissions.IsOwnerOrAdmin]
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permission() for permission in self.permission_classes_by_action['default']]

    def get_queryset(self):
        return Submission.objects.filter(
            competition__slug=self.kwargs.get('competition_slug'),
            user=self.request.user
        ).order_by('-id')

    def create(self, request, *args, **kwargs):
        competition = get_or_none(Competition, slug=kwargs.get('competition_slug'))
        if competition:
            if not competition.is_activate:
                return Response({
                    'success': False,
                    'message': 'Submission could not be created for inactive competition.'
                }, status=status.HTTP_400_BAD_REQUEST)
            if not competition.can_entries_today(request.user):
                return Response({
                    'success': False,
                    'message': 'You have already submitted %s entries today.' % settings.NUMBER_ENTRY_PER_DAY
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer_class()(data=request.data, context={'request':request})
            if serializer.is_valid():
                submission = None
                try:
                    submission = serializer.save(**kwargs)
                    is_success, message = EvaluationCode.objects.validate_submission(submission)
                    if not is_success:
                        # Delete uploaded submission in the error case
                        submission.delete()
                        return Response({'success': is_success, 'message': message}, status=status.HTTP_400_BAD_REQUEST)

                    return Response({'success': is_success, 'uid': submission.uid}, status=status.HTTP_201_CREATED)
                except Exception as e:
                    # Delete uploaded submission in the error case
                    if submission:
                        submission.delete()

        return Response({
            'success': False,
            'message': 'Submission could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(url_path='scoring', methods=['GET'])
    def score_submission(self, request, competition_slug, uid):
        try:
            submission = get_or_none(Submission, uid=uid)
            if submission:
                if not submission.has_access_permission(request.user):
                    return Response({
                        'detail': 'You do not have permission to perform this action.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if not submission.is_unprocessed():
                    return Response({'success': True}, status=status.HTTP_200_OK)

                success, score, is_new, improved_positions = Submission.objects.score_process(submission)
                if success:
                    leaderboard = Leaderboard.objects.final_leaderboard(submission.competition, request.user)
                    return Response({'leaderboard': leaderboard, 'entry_score': score, 'is_new': is_new, 'improved': improved_positions}, status=status.HTTP_200_OK)

                return Response({'success': True}, status=status.HTTP_200_OK)
        except Exception as e:
            pass
        return Response({'detail': 'An error has occurred. Please contact the Administrator.'}, status=status.HTTP_400_BAD_REQUEST)


class EvaluationViewSet(viewsets.ModelViewSet):
    permission_classes = [rest_permissions.IsAdminUser]
    serializer_class_by_action = {
        'update': serializers.EvaluationSerializerForUpdate,
        'default': serializers.EvaluationSerializer
    }

    def get_serializer_class(self):
        try:
            return self.serializer_class_by_action[self.action]
        except KeyError:
            return self.serializer_class_by_action['default']

    def get_queryset(self):
        return EvaluationCode.objects.filter(
            competition__slug=self.kwargs.get('competition_slug')
        ).order_by('-active', '-id')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        if serializer.is_valid():
            try:
                serializer.save(**kwargs)
                return Response({'success': True}, status=status.HTTP_201_CREATED)
            except Exception as e:
                pass

        return Response({
            'error': 'Evaluation could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


class CompetitionLeaderboardViewSet(viewsets.ViewSet):
    permission_classes = (rest_permissions.AllowAny,)

    def list(self, request, competition_slug):
        try:
            competition = get_or_none(Competition, slug=competition_slug)
            if competition:
                limit = int(request.query_params.get('limit', 0))
                data = Leaderboard.objects.final_leaderboard(competition, request.user, limit)
                context = {'leaderboard': data}
                uid = int(request.query_params.get('uid', 0))
                if uid:
                    context.update({
                        'unprocessed': Submission.objects.is_unprocessed_submission(uid, request.user)
                    })

                return Response(context, status=status.HTTP_200_OK)
        except Exception as e:
            pass
        return Response({'detail': 'Not found'}, status=status.HTTP_400_BAD_REQUEST)


class CompetitionDownloadDataView(PathDownloadView):
    def get_path(self):
        competition_data = get_object_or_404(CompetitionData, name=self.kwargs.get('name'),
                                             competition__slug=self.kwargs.get('competition_slug'))
        if competition_data.has_access_permission(self.request.user):
            return competition_data.attachment.path
        return ''

    def get_file(self):
        filepath = self.get_path()
        if not os.path.isfile(filepath):
            raise FileNotFound('File "{0}" does not exists'.format(filepath))
        return File(file=open(filepath, 'rb'), name=self.kwargs.get('name'))


class SubmissionDownloadView(PathDownloadView):
    def get_path(self):
        submission = get_object_or_404(Submission, uid=self.kwargs.get('uid'),
                                             competition__slug=self.kwargs.get('competition_slug'))
        if submission.has_access_permission(self.request.user):
            return [submission.name, submission.file.path]
        return ['', '']

    def get_file(self):
        filename, filepath = self.get_path()
        if not os.path.isfile(filepath):
            raise FileNotFound('File "{0}" does not exists'.format(filepath))
        try:
            zippedFile = get_zip_from_path(filepath, filename, self.kwargs.get('name'))
        except Exception as e:
            raise FileNotFound('File "{0}" does not exists'.format(filepath))
        return zippedFile


class ForumDownloadAttachmentView(PathDownloadView):
    def get_path(self):
        attachment = get_object_or_404(TopicAttachment, name=self.kwargs.get('name'),
                                            topic__slug=self.kwargs.get('topic_slug'))
        return attachment.file.path

    def get_file(self):
        filepath = self.get_path()
        if not os.path.isfile(filepath):
            raise FileNotFound('File "{0}" does not exists'.format(filepath))
        return File(file=open(filepath, 'rb'), name=self.kwargs.get('name'))

