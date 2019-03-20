from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.conf import settings


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = None


class CompetitionForumPagination(StandardResultsSetPagination):
    page_size = 15

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'num_pages': self.page.paginator.num_pages,
            'results': data
        })


class CompetitionPagination(StandardResultsSetPagination):
    page_size = 10

    def get_paginated_response(self, data):
        next = None
        try:
            next = self.get_next_link().split(settings.SITE_DOMAIN)[1] if self.get_next_link() else None
        except:
            try:
                next = self.get_next_link().split(settings.SITE_DOMAIN2)[1] if self.get_next_link() else None
            except:
                pass
        return Response({
            'next': next,
            'competitions': data
        })