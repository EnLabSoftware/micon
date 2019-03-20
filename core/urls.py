from django.conf.urls import url

import views

urlpatterns = [
    url(r'^settings/token/', views.settings_token, name='settings-token'),
    url(r'^settings/front/token', views.front_settings, name='front_settings'),
    url(r'^settings/front/add_slide', views.front_add_new_slide, name='front_add_new_slide'),
    url(r'^settings/front/delete_slide', views.front_delete_slide, name='front_delete_slide'),
    url(r'^settings/site/$', views.site_settings, name='site_settings'),
]
