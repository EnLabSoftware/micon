from rest_framework import permissions
from rest_framework.generics import get_object_or_404

from .models import Competition


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.has_access_permission(request.user)


class CanUserViewCompetitionDetail(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.has_access_permission(request.user)


class CanUserViewCompetitionDataDetail(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.has_access_permission(request.user)


class CanUserViewTrainingDataList(permissions.BasePermission):

    def has_permission(self, request, view):
        obj = get_object_or_404(Competition, slug=view.kwargs.get('competition_slug'))
        if view.action in ['learning_data'] and obj.has_access_permission(request.user):
            return True
        return request.user.is_superuser
