import requests
import urlparse
from django.conf import settings
from django.shortcuts import render
from rest_framework import permissions as rest_permissions, viewsets
from rest_framework.reverse import reverse
from django.views.decorators.csrf import csrf_exempt

import stripe

from utils.http import json_response
from utils.shortcuts import get_or_none
from competitions.models import Competition, Ticket
import competitions.serializers as serializers


# PayPal
PP_NVP_ENDPOINT = settings.PP_NVP_ENDPOINT_SANDBOX if settings.PP_SANDBOX_FLAG \
    else settings.PP_NVP_ENDPOINT_LIVE

# Stripe
ST_PUBLISHABLE_KEY = settings.ST_TEST_PUBLISHABLE_KEY if settings.ST_TEST_FLAG \
    else settings.ST_LIVE_PUBLISHABLE_KEY

if settings.ST_TEST_FLAG:
    stripe.api_key = settings.ST_TEST_SECRET_KEY
else:
    stripe.api_key = settings.ST_LIVE_SECRET_KEY


def paypal_setting():
    if settings.PP_SANDBOX_FLAG:
        return {
            'USER': settings.PP_USER_SANDBOX,
            'PWD': settings.PP_PASSWORD_SANDBOX,
            'SIGNATURE': settings.PP_SIGNATURE_SANDBOX,
            'VERSION': settings.PP_API_VERSION,
        }
    else:
        return {
            'USER': settings.PP_USER,
            'PWD': settings.PP_PASSWORD,
            'SIGNATURE': settings.PP_SIGNATURE,
            'VERSION': settings.PP_API_VERSION,
        }


def init_paypal_ticket(request, competition_title):
    PP_TICKET_INFO = paypal_setting()
    PP_TICKET_INFO.update({
        'PAYMENTREQUEST_0_PAYMENTACTION': 'Sale',
        'PAYMENTREQUEST_0_CURRENCYCODE': 'USD',
        'PAYMENTREQUEST_0_AMT': settings.PP_TICKET_AMOUNT,
        'PAYMENTREQUEST_0_ITEMAMT': settings.PP_TICKET_AMOUNT,
        'PAYMENTREQUEST_0_TAXAMT': 0,
        'L_PAYMENTREQUEST_0_NAME0': 'Ticket',
        'L_PAYMENTREQUEST_0_DESC0': 'Ticket for: %s' % competition_title,
        'L_PAYMENTREQUEST_0_AMT0': settings.PP_TICKET_AMOUNT,
        'L_PAYMENTREQUEST_0_QTY0': 1
    })
    # PP_TICKET_INFO.update({
    #     'L_PAYMENTREQUEST_0_ITEMCATEGORY0': 'Digital',
    #     'REQCONFIRMSHIPPING': 0,
    #     'NOSHIPPING': 1,
    # })

    return PP_TICKET_INFO


@csrf_exempt
def paypal_create(request):
    slug = request.POST.get('slug', '')
    title = request.POST.get('title', '')
    data = init_paypal_ticket(request, title)
    data.update({
        'METHOD': 'SetExpressCheckout',
        'SOLUTIONTYPE': 'Sole',
        # 'LANDINGPAGE': 'Billing',
        'RETURNURL': reverse('paypal-return', request=request, kwargs={'competition_slug': slug}),
        'CANCELURL': reverse('paypal-cancel', request=request, kwargs={'competition_slug': slug})
    })

    response = requests.post(PP_NVP_ENDPOINT, data=data)
    result = dict(urlparse.parse_qsl(response.text))
    is_success = result.get('ACK', '') == 'Success'
    token = result.get('TOKEN', '')

    if is_success:
        return json_response({'success': is_success, 'token': token})

    return json_response({'success': is_success, 'token': False, 'message': result.get('L_LONGMESSAGE0', '')}, 400)


@csrf_exempt
def paypal_execute(request):
    slug = request.POST.get('slug', '')
    title = request.POST.get('title', '')
    payerID = request.POST.get('payerID', '')
    paymentToken = request.POST.get('paymentToken', '')

    data = init_paypal_ticket(request, title)
    data.update({
        'METHOD': 'DoExpressCheckoutPayment',
        'TOKEN': paymentToken,
        'PAYERID': payerID,
    })

    response = requests.post(PP_NVP_ENDPOINT, data=data)
    result = dict(urlparse.parse_qsl(response.text))
    is_success = result.get('ACK', '') == 'Success'
    competition = get_or_none(Competition, slug=slug)
    if is_success:
        context = {'success': is_success, 'message': 'Thank you! Your payment was processed successfully.'}
        status = 200
    else:
        context = {'success': is_success, 'message': result.get('L_LONGMESSAGE0', '')}
        status = 400
    try:
        Ticket.objects.paypal_create(
            competition=competition,
            user=request.user,
            paymentID=paymentToken,
            status=Ticket.STATUS_COMPLETED if is_success else Ticket.STATUS_FAILED,
            message_log=result.get('L_LONGMESSAGE0', '') if not is_success else '',
            data=result
        )
    except Exception as e:
        context = {'success': is_success, 'message': 'An error has occurred. Please contact Administrator.'}
        status = 400

    return json_response(context, status)


def paypal_return(request, competition_slug):
    paymentToken = request.GET.get('token', '')
    data = paypal_setting()
    data.update({
        'METHOD': 'GetExpressCheckoutDetails',
        'TOKEN': paymentToken
    })

    response = requests.post(PP_NVP_ENDPOINT, data=data)
    result = dict(urlparse.parse_qsl(response.text))
    is_success = result.get('CHECKOUTSTATUS', '') == 'PaymentActionCompleted'

    if is_success:
        competition = get_or_none(Competition, slug=competition_slug)
        try:
            Ticket.objects.paypal_create(
                competition=competition,
                user=request.user,
                paymentID=paymentToken,
                status=Ticket.STATUS_COMPLETED,
                data=result
            )
        except Exception as e:
            is_success = False

    return render(request, 'payment/paypal/return.html', {
        'is_success': is_success
    })


def paypal_cancel(request, competition_slug):
     return render(request, 'payment/paypal/cancel.html')


def stripe_create(request):
    slug = request.POST.get('slug', '')
    title = request.POST.get('title', '')
    paymentToken = request.POST.get('paymentToken', '')

    competition = get_or_none(Competition, slug=slug)
    if competition:
        is_success = False
        message_log = ''
        try:
          charge = stripe.Charge.create(
              amount=settings.ST_TICKET_AMOUNT,
              currency="usd",
              source=paymentToken,
              description="Ticket for: %s" % title
          )
          is_success = True
        except stripe.error.CardError as e:
            # Since it's a decline, stripe.error.CardError will be caught
            error = e.json_body['error']
            message_log = error['message']
            return json_response({'message': 'Payment error: %s' % error['message']}, 400)
        except stripe.error.StripeError as e:
            error = e.json_body['error']
            message_log = error['message']
            return json_response({'message': 'Payment error: %s' % error['message']}, 400)
        except Exception as e:
            message_log = str(e.message)
            return json_response({'message': 'An error has occurred. Please contact Administrator.'}, 400)

        try:
            Ticket.objects.stripe_create(
                competition=competition,
                user=request.user,
                paymentID=charge.id,
                status=Ticket.STATUS_COMPLETED if is_success else Ticket.STATUS_FAILED,
                data=charge,
                message_log=message_log
            )
            return json_response({'message': 'Thank you! Your payment was processed successfully.'})
        except Exception as e:
            pass

    return json_response({'message': 'An error has occurred. Please contact Administrator.'}, 400)


class AdminTicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-id')
    permission_classes = [rest_permissions.IsAdminUser]
    serializer_class = serializers.TicketSerializer
