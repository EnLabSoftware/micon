from allauth.socialaccount.helpers import complete_social_login
from django.contrib.auth import get_user_model
from rest_auth.registration.serializers import SocialLoginSerializer
from rest_framework import serializers
from authentication.models import Account
from competitions.serializers import CustomImageField
from requests.exceptions import HTTPError
from django.conf import settings
from rest_auth.serializers import LoginSerializer as RestAuthLoginSerializer
from rest_auth.registration.serializers import RegisterSerializer as RestAuthRegisterSerializer
from rest_framework import exceptions


UserModel = get_user_model()

class LoginSerializer(RestAuthLoginSerializer):

    # just custom error message
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = None

        # Authentication using allauth
        if 'allauth' in settings.INSTALLED_APPS:
            from allauth.account import app_settings

            # Authentication through username
            if app_settings.AUTHENTICATION_METHOD == app_settings.AuthenticationMethod.USERNAME:
                user = self._validate_username(username, password)

        else:
            # Authentication without using allauth
            if username:
                user = self._validate_username_email(username, '', password)

        # Did we get back an active user?
        if user:
            if not user.is_active:
                msg = 'Your account is disabled. Please contact administrator.'
                raise exceptions.ValidationError({'error_message':msg})
        else:
            msg = 'The username or password is incorrect. Please try again.'
            raise exceptions.ValidationError({'error_message':msg})

        # If required, is the email verified?
        if 'rest_auth.registration' in settings.INSTALLED_APPS:
            from allauth.account import app_settings
            if app_settings.EMAIL_VERIFICATION == app_settings.EmailVerificationMethod.MANDATORY:
                email_address = user.emailaddress_set.get(email=user.email)
                if not email_address.verified:
                    raise serializers.ValidationError({'error_message':'Your email is not verified.'})

        attrs['user'] = user
        return attrs


class RegisterSerializer(RestAuthRegisterSerializer):

    def validate_password1(self, password):
        return password


# class AccountSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=False)
#
#     class Meta:
#         model = Account
#         fields = ('id', 'url', 'username', 'email', 'created_at', 'updated_at', 'password',)
#         extra_kwargs = {
#             'url': {'lookup_field': 'username'},
#         }
#         read_only_fields = ('created_at', 'updated_at',)


class AccountProfileSerializer(serializers.HyperlinkedModelSerializer):
    gender_label = serializers.ReadOnlyField(source='gender_name')
    avatar = CustomImageField(use_url=True, max_length=None)

    class Meta:
        model = Account
        fields = ('username', 'display_name', 'first_name', 'last_name', 'birth_day', 'gender', 'gender_label', 'email',
                  'phone_number', 'avatar', 'is_active', 'is_verified', 'last_login', 'is_social')
        read_only_fields = ('username', 'email', )

    def update(self, instance, validated_data):
        if instance.avatar and validated_data['avatar'] and \
                instance.avatar.file.read() == validated_data['avatar'].read():
            del validated_data['avatar']
        return super(AccountProfileSerializer, self).update(instance, validated_data)


class AccountProfileSerializerForUpdateAvatar(AccountProfileSerializer):
    class Meta:
        model = Account
        fields = ('avatar',)


class AccountProfileSerializerForUpdateInfo(AccountProfileSerializer):
    class Meta:
        model = Account
        fields = ('display_name', 'first_name', 'last_name', 'birth_day', 'gender', 'phone_number', 'email', )


class MySocialLoginSerializer(SocialLoginSerializer):

    def get_social_login(self, adapter, app, token, response):
        request = self._get_request()
        social_login = adapter.complete_login(request, app, token, response=response)
        social_login.token = token

        if not social_login.user.email and social_login.account.provider == 'facebook':
            social_login.user.email = social_login.account.uid + '@facebook.com'

        if not social_login.user.username:
            social_login.user.username = social_login.user.email.split('@')[0]
            if "." in social_login.user.username:
                social_login.user.username = social_login.user.username.replace(".","_")
            if Account.objects.filter(username=social_login.user.username).exists():
                c = 1
                while True:
                    social_login.user.username = social_login.user.username + str(c)
                    if not Account.objects.filter(username=social_login.user.username).exists():
                        break
                    c += 1

        return social_login

    def validate(self, attrs):
        view = self.context.get('view')
        request = self._get_request()

        if not view:
            raise serializers.ValidationError('View is not defined, pass it as a context variable')

        adapter_class = getattr(view, 'adapter_class', None)
        if not adapter_class:
            raise serializers.ValidationError('Define adapter_class in view')

        adapter = adapter_class(request)
        app = adapter.get_provider().get_app(request)

        # More info on code vs access_token
        # http://stackoverflow.com/questions/8666316/facebook-oauth-2-0-code-and-token

        # Case 1: We received the access_token
        if 'access_token' in attrs:
            access_token = attrs.get('access_token')

        # Case 2: We received the authorization code
        elif 'code' in attrs:
            self.callback_url = getattr(view, 'callback_url', None)
            self.client_class = getattr(view, 'client_class', None)

            if not self.callback_url:
                raise serializers.ValidationError('Define callback_url in view')
            if not self.client_class:
                raise serializers.ValidationError('Define client_class in view')

            code = attrs.get('code')

            provider = adapter.get_provider()
            scope = provider.get_scope(request)
            client = self.client_class(
                request,
                app.client_id,
                app.secret,
                adapter.access_token_method,
                adapter.access_token_url,
                self.callback_url,
                scope
            )
            token = client.get_access_token(code)
            access_token = token['access_token']

        else:
            raise serializers.ValidationError('Incorrect input. access_token or code is required.')

        token = adapter.parse_token({'access_token': access_token})
        token.app = app

        try:
            login = self.get_social_login(adapter, app, token, access_token)
            complete_social_login(request, login)
        except HTTPError:
            raise serializers.ValidationError('Incorrect value')
        except Exception as e:
            pass

        if not login.is_existing:
            login.lookup()
            login.save(request, connect=True)
        attrs['user'] = login.account.user

        return attrs
