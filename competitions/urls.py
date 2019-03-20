from django.conf.urls import url

import views

urlpatterns = [
    url(
        r'^(?P<competition_slug>[^/.]+)/download/(?P<name>.*)/$',
        views.CompetitionDownloadDataView.as_view(), {},
        name='competition-data-download'
    ),
    url(
        r'^(?P<competition_slug>[^/.]+)/submissions/(?P<uid>.*)/(?P<name>.*)\.zip/$',
        views.SubmissionDownloadView.as_view(), {},
        name='submission-download'),
    url(
        r'^(?P<competition_slug>[^/.]+)/forums/t/(?P<topic_slug>[^/.]+)/attachment/(?P<name>.*)/$',
        views.ForumDownloadAttachmentView.as_view(), {},
        name='forum-attachment-download'
    ),
]
