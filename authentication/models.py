from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.contrib.auth.models import BaseUserManager
from utils.file.tools import generate_upload_path
from django.conf import settings


def generate_avatar_upload_path(instance, fname):
    return generate_upload_path(fname, settings.ACCOUNT_AVATAR)


class AccountManager(BaseUserManager):
    def create_account(self, username, password, **kwargs):
        if not username:
            raise ValueError('Users must have a valid username')

        if not password:
            raise ValueError('Users must have a valid password.')

        if not kwargs.get('email'):
            raise ValueError('Users must have a valid email.')

        account = self.model(
            username=username, email=self.normalize_email(kwargs.get('email'))
        )
        account.is_active = True
        account.set_password(password)
        account.save()

        return account

    def create_superuser(self, username, password, **kwargs):
        account = self.create_account(username, password, **kwargs)
        account.is_superuser = True
        account.save()

        return account


class Account(AbstractBaseUser, PermissionsMixin):
    GENDER_MALE = 0
    GENDER_FEMALE = 1
    GENDER = (
        (GENDER_MALE, 'Male'),
        (GENDER_FEMALE, 'Female')
    )

    username = models.CharField(max_length=40, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    display_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to=generate_avatar_upload_path, null=True)
    phone_number = models.CharField(max_length=15, null=True)
    birth_day = models.DateField(null=True)
    gender = models.IntegerField(choices=GENDER, default=GENDER_MALE)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.is_superuser

    @property
    def gender_name(self):
        for key, val in self.GENDER:
            if key == self.gender:
                return val
        return ''

    @property
    def is_social(self):
        try:
            return self.socialaccount_set.values()[0].get('provider')
        except:
            return ''
    @property
    def is_verified(self):
        try:
            return self.emailaddress_set.values()[0].get('verified')
        except:
            return False

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username
