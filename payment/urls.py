from django.conf.urls import url

import views

urlpatterns = [
    url('^payment/paypal/create-payment/$', views.paypal_create, name='paypal-create'),
    url('^payment/paypal/execute-payment/$', views.paypal_execute, name='paypal-execute'),
    url('^payment/stripe/create-payment/$', views.stripe_create, name='paypal-create'),
    url('^(?P<competition_slug>[^/.]+)/payment/paypal/return/$', views.paypal_return, name='paypal-return'),
    url('^(?P<competition_slug>[^/.]+)/payment/paypal/cancel/$', views.paypal_cancel, name='paypal-cancel'),
]
