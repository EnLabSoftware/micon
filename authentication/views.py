import os
from django.dispatch import receiver
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import api_view, permission_classes, detail_route
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings
from allauth.socialaccount.models import SocialAccount
import serializers
from .models import Account
from .permissions import IsAccountOwner
from utils.shortcuts import get_or_none
from utils.file.tools import sending_email
from allauth.account.signals import email_confirmed
from allauth.socialaccount.signals import pre_social_login
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_auth.registration.views import SocialLoginView
from allauth.account.models import EmailAddress
from django.contrib.auth import login, authenticate
import base64
from utils.file.tools import generate_upload_path
from django.conf import settings


class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter
    serializer_class = serializers.MySocialLoginSerializer


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    serializer_class = serializers.MySocialLoginSerializer


@api_view(['GET','POST'])
@permission_classes([permissions.AllowAny,])
def username_validation(request):
    if Account.objects.filter(username=request.data.get('username')).exists():
        return Response({'success': True, 'message':'This username already exists.'})
    return Response({'success': False, 'message':''})


@api_view(['GET','POST'])
@permission_classes([permissions.AllowAny,])
def email_validation(request):
    if Account.objects.filter(email=request.data.get('email')).exists():
        return Response({'success' :True, 'message':'This email already exists.'})
    return Response({'success': False, 'message':''})


@api_view(['POST'])
@permission_classes([permissions.AllowAny,])
def is_new_social(request):
    uid = request.data.get('uid')
    if SocialAccount.objects.filter(uid=uid).exists():
        return Response({'exist':True})
    return Response({'exist':False})


@api_view(['POST'])
@permission_classes([permissions.AllowAny,])
def log_user_in(request):
    try:
        user = Account.objects.get(username=request.data.get('username'))
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
    except Exception as e:
        print(str(e))
    jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    payload = jwt_payload_handler(user)
    token = jwt_encode_handler(payload)
    return Response(token, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny,])
def is_verified_email(request):
    user = Account.objects.get(username=request.data.get('username'))
    is_verified = EmailAddress.objects.get(user=user).verified
    return Response({'is_verified': is_verified})


class AccountViewSet(viewsets.ModelViewSet):
    lookup_field = 'username'
    queryset = Account.objects.all()

    serializer_classes_by_action = {
        'list':  serializers.AccountProfileSerializer,
        'update_avatar': serializers.AccountProfileSerializerForUpdateAvatar,
        'update_info': serializers.AccountProfileSerializerForUpdateInfo,
        'default': serializers.AccountProfileSerializer,
    }

    def get_serializer_class(self):
        try:
            return self.serializer_classes_by_action[self.action]
        except (KeyError, AttributeError):
            return self.serializer_classes_by_action['default']

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return (permissions.IsAuthenticated(),)  # only logged in users can see accounts

        if self.request.method == 'POST' or self.request.method == 'GET':
            return (permissions.AllowAny(),)

        return (permissions.IsAuthenticated(), IsAccountOwner(),)

    # @detail_route(methods=['PUT'], url_path='avatar')
    # def update_avatar(self, request, *args, **kwargs):
    #     serializer = self.get_serializer_class()(data=request.data, context={'request':request})
    #     if serializer.is_valid():
    #         try:
    #             account = get_or_none(Account, username=kwargs.get('username'))
    #             avatar_b64 = request.data.get('avatar')
    #             base64_image_str = avatar_b64[avatar_b64.find(",")+1:]
    #             file_path = generate_upload_path('avatar.png', 'media/'+settings.ACCOUNT_AVATAR)
    #             directory = os.path.dirname(file_path)
    #             if not os.path.exists(directory):
    #                 os.makedirs(directory)
    #             fh = open(file_path, "wb")
    #             fh.write(base64.b64decode(base64_image_str))
    #             fh.close()
    #             size = os.path.getsize(file_path)
    #             if size > 5242880: # 5MB
    #                 os.remove(file_path)
    #                 return Response({'error': 'The file size exceeds the limit allowed'},status=status.HTTP_400_BAD_REQUEST)
    #             if account.avatar:
    #                 os.remove('media/'+str(account.avatar))
    #             account.avatar = file_path.split('media/')[1]
    #             account.save()
    #             jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
    #             jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    #             payload = jwt_payload_handler(account)
    #             token = jwt_encode_handler(payload)
    #             return Response(token, status=status.HTTP_201_CREATED)
    #         except Exception as e:
    #             pass
    #     return Response({'error':'An error has occurred. Please try again'},status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['PUT'], url_path='avatar')
    def update_avatar(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        if serializer.is_valid():
            try:
                acc = get_or_none(Account, username=kwargs.get('username'))
                avatar = request.data.get('avatar', '')
                if avatar.size > 5242880:
                    return Response({'error': 'The file size is exceeding maximum size of 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
                self.partial_update(request, *args, **kwargs)
                # add JWT token to response
                if acc.avatar:
                    os.remove(acc.avatar.path)
                account = get_or_none(Account, username=kwargs.get('username'))
                jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
                payload = jwt_payload_handler(account)
                token = jwt_encode_handler(payload)
                return Response(token, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': 'An error has occurred. Please try again!'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['PUT'], url_path='info')
    def update_info(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data, context={'request':request})
        if serializer.is_valid() or serializer.errors.get('email', ''):
            try:
                is_email_changed = False
                account = get_or_none(Account, username=kwargs.get('username'))
                if account.email != serializer.data.get('email'):
                    is_email_changed = True
                Account.objects.filter(username=kwargs.get('username')).update(
                    email=serializer.data.get('email'),
                    first_name=serializer.data.get('first_name'),
                    last_name=serializer.data.get('last_name'),
                    display_name=serializer.data.get('display_name'),
                    birth_day=serializer.data.get('birth_day'),
                    gender=serializer.data.get('gender'),
                    phone_number=serializer.data.get('phone_number')
                )
                if is_email_changed:
                    email_address = EmailAddress.objects.get(user=account)
                    email_address.email = serializer.data.get('email')
                    email_address.save()
                # add JWT token to response
                account = get_or_none(Account, username=kwargs.get('username'))
                jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
                payload = jwt_payload_handler(account)
                token = jwt_encode_handler(payload)
                return Response(token, status=status.HTTP_201_CREATED)
            except Exception as e:
                pass

        return Response(status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['PUT'], url_path='active')
    def active(self, request, *args, **kwargs):
        account = get_or_none(Account, username=kwargs.get('username'))
        account.is_active = not account.is_active
        account.save()
        return Response({'success': False}, status=status.HTTP_200_OK)

    @detail_route(methods=['DELETE'], url_path='delete')
    def delete(self, request, *args, **kwargs):
        account = get_or_none(Account, username=kwargs.get('username'))
        account.delete()
        return Response({'success': False}, status=status.HTTP_200_OK)


@receiver (pre_social_login)
def pre_social_login(sender, request, sociallogin=None, **kwargs):
    try:
        user = Account.objects.get(email=sociallogin.account.extra_data['email'].lower())
        sociallogin.connect(request, user)
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        return Response(token, status=status.HTTP_201_CREATED)
    except Exception as e:
        pass
    try:
       last_login = sociallogin.account.last_login
       if not last_login:
           sending_email(sociallogin.account.extra_data['email'].lower())
    except Exception as e:
       pass


@receiver(email_confirmed)
def email_confirmed(request, email_address, **kwargs):
    sending_email(email_address.email)