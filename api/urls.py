from django.conf.urls import url, include
from rest_framework_nested import routers
from rest_framework_jwt.views import obtain_jwt_token,refresh_jwt_token

from authentication import views as auth_views
from competitions import views as comp_views
from payment import views as pay_views
from core import views as core_views

router = routers.SimpleRouter()
router.register(r'accounts', auth_views.AccountViewSet)
router.register(r'competitions', comp_views.CompetitionViewSet)
router.register(r'submissions', comp_views.AdminSubmissionViewSet)
router.register(r'forums', comp_views.AdminForumTopicViewSet)
router.register(r'payments', pay_views.AdminTicketViewSet)
competitions_router = routers.NestedSimpleRouter(router, r'competitions', lookup='competition')
competitions_router.register(r'data', comp_views.CompetitionDataViewSet, base_name='competition-data')
competitions_router.register(r'prizes', comp_views.PrizeViewSet, base_name='competition-prize')
competitions_router.register(r'forums', comp_views.ForumTopicViewSet, base_name='competition-topic')
competitions_router.register(r'submissions', comp_views.SubmissionViewSet, base_name='competition-submission')
competitions_router.register(r'evaluations', comp_views.EvaluationViewSet, base_name='competition-evaluation')
competitions_router.register(r'leaderboard', comp_views.CompetitionLeaderboardViewSet, base_name='competition-leaderboard')

""" URL patterns"""
urlpatterns = [
    url(r'', include('core.urls')),
    url(r'^auth/', include('rest_auth.urls')),
    url(r'^auth/registration/', include('rest_auth.registration.urls')),
    url(r'^auth/facebook/$', auth_views.FacebookLogin.as_view(), name='fb_login'),
    url(r'^auth/google/$', auth_views.GoogleLogin.as_view(), name='gg_login'),
    url(r'^auth/is_new_social/', auth_views.is_new_social, name='is_new_social'),
    url(r'^auth/token/', obtain_jwt_token),
    url(r'^auth/token/refresh/', refresh_jwt_token),
    url(r'^auth/validation/username/', auth_views.username_validation, name='username_validation'),
    url(r'^auth/validation/email/', auth_views.email_validation, name='email_validation'),
    url(r'^auth/log_user_in', auth_views.log_user_in, name='log_user_in'),
    url(r'^auth/is_verified_email', auth_views.is_verified_email, name='is_verified_email'),

    url(r'', include(router.urls)),
    url(r'', include(competitions_router.urls)),
]

""" Strip Payment patterns"""
