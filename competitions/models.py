import os
from datetime import date, datetime, timedelta
from uuid import uuid4

from django.conf import settings
from django.utils import timezone
from django.db import models
from django.db.models import Count, Max, F, Sum
from django.db.models import QuerySet
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils.text import slugify
from picklefield import PickledObjectField

from utils.file.tools import generate_upload_path, remove_file, filesizeformat
from authentication.models import Account


def generate_data_upload_path(instance, fname):
    return generate_upload_path(fname, settings.COMPETITION_DATA)

def generate_evaluation_upload_path(instance, fname):
    return generate_upload_path(fname, settings.COMPETITION_EVALUATION)

def generate_submission_upload_path(instance, fname):
    return generate_upload_path(fname, settings.SUBMISSION_FILE)

def generate_image_upload_path(instance, fname):
    return generate_upload_path(fname, settings.COMPETITION_IMAGE)

def generate_topic_upload_path(instance, fname):
    return generate_upload_path(fname, settings.FORUM_ATTACHMENT)


class CompetitionManager(models.Manager):
    def available(self):
        return self.filter(status=Competition.STATUS_ACTIVATE)


class Competition(models.Model):
    STATUS_INACTIVATE = 1
    STATUS_ACTIVATE = 2
    STATUS_FINISHED = 3
    STATUS_INCOMING = 4
    STATUS = (
        (STATUS_INACTIVATE, 'Inactivate'),
        (STATUS_INCOMING, 'Incoming'),
        (STATUS_ACTIVATE, 'Activate'),
        (STATUS_FINISHED, 'Finished')
    )

    TYPE_DEFAULT = 0
    TYPE_SUPERVISED = 1
    TYPE_UNSUPERVISED = 2
    TYPE_REINFORCEMENT_LEARNING = 3
    TYPES = (
        (TYPE_DEFAULT, '----------'),
        (TYPE_SUPERVISED, 'Supervised'),
        (TYPE_UNSUPERVISED, 'Unsupervised'),
        (TYPE_REINFORCEMENT_LEARNING, 'Reinforcement Learning')
    )


    objects = CompetitionManager()

    title = models.CharField(max_length=250)
    description = models.TextField()
    short_description = models.TextField()
    logo = models.ImageField(upload_to=generate_image_upload_path)
    image = models.ImageField(upload_to=generate_image_upload_path)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.IntegerField(choices=STATUS, default=STATUS_INACTIVATE)
    slug = models.SlugField(unique=True)
    type = models.IntegerField(blank=True, choices=TYPES)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def status_name(self):
        for key, val in self.STATUS:
            if key == self.status:
                return val
        return ''

    @property
    def is_inactivate(self):
        return self.status == self.STATUS_INACTIVATE

    @property
    def is_incoming(self):
        return self.status == self.STATUS_INCOMING

    @property
    def is_activate(self):
        return self.status == self.STATUS_ACTIVATE

    @property
    def entries(self):
        return self.submissions.count()

    @property
    def players(self):
        return self.submissions.aggregate(
            players=Count('user', distinct=True)
        )['players']

    @property
    def total_prizes(self):
        return self.prizes.aggregate(
            total_prizes=Sum('money')
        )['total_prizes'] or 0

    @property
    def ticket_dieline(self):
        a = self.end_time - self.start_time
        b = (a.days*settings.CAN_TICKET_BEFORE)/100
        return self.start_time + timedelta(days=b)

    @property
    def is_evaluations_code(self):
        return True if self.evaluations.all().count() > 0 else False

    @property
    def can_submission(self):
        return self.start_time < timezone.now() and timezone.now() < self.end_time \
               and self.data_files.count() != 0 and self.is_evaluations_code

    @property
    def can_ticket(self):
        return timezone.now() < self.ticket_dieline

    @property
    def x_test_file(self):
        return self.data_files.filter(type=CompetitionData.TYPE_XTEST).last()

    @property
    def y_test_file(self):
        return self.data_files.filter(type=CompetitionData.TYPE_YTEST).last()

    @property
    def time_progress(self):
        sum = self.end_time - self.start_time
        passed = timezone.now() - self.start_time
        percent = round((passed.total_seconds()*100)/sum.total_seconds(),2)
        if percent <= 0:
            percent = 0
        if percent > 100:
            percent = 100
        return percent

    def check_ticketed(self, user):
        if user.is_authenticated:
            return self.tickets.filter(user=user, competition=self, status=Ticket.STATUS_COMPLETED).exists()
        return False

    def has_access_permission(self, user):
        if self.status in [self.STATUS_ACTIVATE, self.STATUS_FINISHED, self.STATUS_INCOMING]:
            return True
        return user.is_superuser

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super(Competition, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title

    def can_entries_today(self, user):
        if not user.is_authenticated:
            return 0
        n = settings.NUMBER_ENTRY_PER_DAY - self.submissions.filter(
            user=user, uploaded__startswith=date.today()).count()
        return n if n > 0 else 0


class CompetitionDataManager(models.Manager):
    def get_learning_data_by_slug(self, slug):
        return self.filter(type__in=[
            CompetitionData.TYPE_XTRAIN,
            CompetitionData.TYPE_YTRAIN,
            CompetitionData.TYPE_XTEST,
        ], competition__slug=slug)


class CompetitionData(models.Model):
    TYPE_DEFAULT = 0
    TYPE_XTRAIN = 1
    TYPE_YTRAIN = 2
    TYPE_XTEST = 3
    TYPE_YTEST = 4
    TYPES = (
        (TYPE_XTRAIN, 'X Train'),
        (TYPE_YTRAIN, 'Y Train'),
        (TYPE_XTEST, 'X Test'),
        (TYPE_YTEST, 'Y Test'),
    )

    objects = CompetitionDataManager()

    competition = models.ForeignKey(Competition, related_name='data_files')
    name = models.CharField(max_length=255)
    attachment = models.FileField(upload_to=generate_data_upload_path)
    description = models.TextField(null=True)
    type = models.IntegerField(choices=TYPES, default=TYPE_DEFAULT)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def type_name(self):
        for key, val in self.TYPES:
            if key == self.type:
                return val
        return ''

    @property
    def format(self):
        return os.path.splitext(self.attachment.name)[1]

    @property
    def size(self):
        return filesizeformat(self.attachment.size)

    def has_access_permission(self, user):
        if self.type == self.TYPE_YTEST \
            or self.competition.is_inactivate:
            return user.is_superuser
        return True


class Prize(models.Model):
    PLACE_1 = 1
    PLACE_2 = 2
    PLACE_3 = 3
    PLACE_4 = 4
    PLACE_5 = 5
    PLACES = (
        (PLACE_1, '1st place'),
        (PLACE_2, '2nd place'),
        (PLACE_3, '3rd place'),
        (PLACE_4, '4th place'),
        (PLACE_5, '5th place'),
    )

    competition = models.ForeignKey(Competition, related_name='prizes')
    money = models.IntegerField(default=0)
    place = models.IntegerField(choices=PLACES)
    description = models.TextField(null=True)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def name(self):
        for key, val in self.PLACES:
            if key == self.place:
                return val
        return ''


class LeaderboardManager(models.Manager):
    def rank_process(self, competition, user):
        obj, created = self.get_or_create(
            competition=competition,
            user=user
        )
        if created:
            improved_positions = obj.update_rank(is_new=True)
        else:
            improved_positions = obj.update_rank()

        return created, improved_positions

    def get_leaderboard(self, competition, limit=0):
        data = competition.submissions.filter(competition=competition, processed=True, status=Submission.STATUS_SUCCESS) \
            .annotate(user_name=F('user__username'), user_display=F('user__display_name')) \
            .values('user_name', 'user_display') \
            .annotate(score=Max('score'), entries=Count('id'), last_submission=Max('uploaded')) \
            .order_by('-score', 'last_submission')
        if data and limit:
            return data[0:limit]
        return data

    def get_current_rank(self, competition, user):
        current_rank = 0
        leaderboard = self.get_leaderboard(competition)
        if isinstance(leaderboard, QuerySet):
            try:
                pos = leaderboard.filter(user_name=user.username).last()
                current_rank = int(list(leaderboard).index(pos) + 1)
            except Exception as e:
                pass
        return current_rank

    def final_leaderboard(self, competition, user, limit=0):
        data = self.get_leaderboard(competition, limit)
        for d in data:
            lb = self.filter(competition=competition, user__username=d.get('user_name', '')).last()
            d.update({
                'delta': lb.compute_rank_delta() if lb else 'new'
            })
            if user.is_authenticated and user.username == d.get('user_name', ''):
                d.update({
                    'current_rank': Leaderboard.objects.get_current_rank(competition, user)
                })

        return data


class Leaderboard(models.Model):

    objects = LeaderboardManager()

    competition = models.ForeignKey(Competition, related_name='leaderboard')
    user = models.ForeignKey(Account, related_name='leaderboards')
    best_rank = models.IntegerField(default=0)
    old_rank = models.IntegerField(default=0)
    updated = models.DateTimeField(auto_now=True)

    @property
    def current_rank(self):
        return Leaderboard.objects.get_current_rank(self.competition, self.user)

    def update_rank(self, is_new=False):
        improved_positions = 0
        current_rank = self.current_rank
        if is_new:
            self.best_rank = current_rank
            self.save()
        elif current_rank < self.best_rank: #update the rank after a week
            self.old_rank = self.best_rank
            self.best_rank = current_rank
            self.save()
            improved_positions = self.old_rank - self.best_rank
        return improved_positions

    def compute_rank_delta(self):
        if not self.old_rank:
            return 'new'
        else:
            return int(self.current_rank - self.best_rank)


class SubmissionManager(models.Manager):
    def unprocessed_submissions(self, competition=None, user=None):
        submissions = self.filter(processed=False, status=Submission.STATUS_SUCCESS)
        if competition:
            submissions = submissions.filter(competition=competition)
        if user:
            submissions = submissions.filter(user=user)
        return submissions

    def is_unprocessed_submission(self, uid, user):
        if not user.is_authenticated:
            return False
        return self.unprocessed_submissions(user=user).filter(uid=uid).exists()

    def score_process(self, submission):
        is_new = False
        improved_positions = 0
        try:
            success, score = EvaluationCode.objects.score_submission(submission)
            if success:
                is_new, improved_positions = Leaderboard.objects.rank_process(submission.competition, submission.user)

            return success, score, is_new, improved_positions
        except Exception as e:
            submission.status = Submission.STATUS_ERROR
            submission.message_log = 'An error has occurred. Please contact the Administrator.'
            submission.save()
        return False, 0


class Submission(models.Model):
    STATUS_SUCCESS = 1
    STATUS_ERROR = 2
    STATUS = (
        (STATUS_SUCCESS, 'Success'),
        (STATUS_ERROR, 'Error'),
    )

    objects = SubmissionManager()

    competition = models.ForeignKey(Competition, related_name='submissions')
    user = models.ForeignKey(Account, related_name='submissions')
    uid = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=generate_submission_upload_path)
    description = models.TextField(null=True)
    score = models.FloatField(default=0)
    status = models.IntegerField(choices=STATUS, default=STATUS_SUCCESS)
    processed = models.BooleanField(default=False)
    message_log = models.TextField(null=True)
    uploaded = models.DateTimeField(auto_now_add=True)

    @property
    def status_name(self):
        for key, val in self.STATUS:
            if key == self.status:
                return val
        return ''

    def is_valid(self):
        return self.status == Submission.STATUS_SUCCESS

    def is_unprocessed(self):
        return self.processed == False

    def save(self, *args, **kwargs):
        if not self.uid:
            base = '%s' % uuid4().int
            self.uid = '%s%s' % (base[0:4], datetime.now().strftime("%y%m%d%H%M%S"))
        super(Submission, self).save(*args, **kwargs)

    def has_access_permission(self, user):
        if self.user == user or user.is_superuser:
            return True
        return False


class EvaluationCodeManger(models.Manager):
    def validate_submission(self, submission):
        eva = self.filter(competition=submission.competition, active=True).last()
        if eva:
            try:
                file = open(eva.file.path, 'r')
                code = file.read()
                exec(code, locals())
                validation_func = locals()[eva.validation_func]
                message = validation_func(submission.file.path)
                return True, message
            except Exception as e:
                pass
        return False, "An error has occurred. Please contact the Administrator."

    def score_submission(self, submission):
        eva = self.filter(competition=submission.competition, active=True).last()
        if eva:
            try:
                file = open(eva.file.path, 'r')
                code = file.read()
                exec(code, locals())
                evaluation_func = locals()[eva.evaluation_func]
                y_test = submission.competition.y_test_file
                score = evaluation_func(submission.file.path, y_test.attachment.path)
                submission.score = score
                submission.status = Submission.STATUS_SUCCESS
                submission.processed = True
                submission.save()
                eva.message_log = ""
                eva.save()
                return True, score
            except Exception as e:
                submission.status = Submission.STATUS_ERROR
                submission.message_log = 'An error has occurred. Please contact the Administrator.'
                submission.save()
                eva.message_log = str(e)
                eva.save()
        return False, 0


class EvaluationCode(models.Model):
    competition = models.ForeignKey(Competition, related_name='evaluations')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=generate_evaluation_upload_path)
    evaluation_func = models.CharField(max_length=50)
    validation_func = models.CharField(max_length=50)
    description = models.TextField(null=True)
    active = models.BooleanField(default=False)
    message_log = models.CharField(max_length=255, null=True)
    uploaded = models.DateTimeField(auto_now_add=True)

    objects = EvaluationCodeManger()

    def save(self, *args, **kwargs):
        if self.active:
            EvaluationCode.objects.filter(
                competition=self.competition, active=True
            ).update(active=False)

        super(EvaluationCode, self).save(*args, **kwargs)


class TicketManager(models.Manager):
    def paypal_create(self, **kwargs):
        kwargs.update({'method': Ticket.TYPE_PAYPAL})
        return self.create(**kwargs)

    def stripe_create(self, **kwargs):
        kwargs.update({'method': Ticket.TYPE_STRIPE})
        return self.create(**kwargs)


class Ticket(models.Model):
    TYPE_STRIPE = 'stripe'
    TYPE_PAYPAL = 'paypal'
    TYPES = (
        (TYPE_STRIPE, 'Stripe'),
        (TYPE_PAYPAL, 'PayPal')
    )

    STATUS_INPROGRESS = 1
    STATUS_FAILED = 2
    STATUS_COMPLETED = 3
    STATUS = (
        (STATUS_INPROGRESS, 'Inprogress'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_COMPLETED, 'Completed')
    )

    objects = TicketManager()

    competition = models.ForeignKey(Competition, related_name='tickets')
    user = models.ForeignKey(Account, related_name='tickets')
    method = models.CharField(choices=TYPES, max_length=10)
    paymentID = models.CharField(max_length=255)
    status = models.IntegerField(choices=STATUS)
    data = PickledObjectField()
    message_log= models.CharField(max_length=255, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def payment_method(self):
        for key, val in self.TYPES:
            if key == self.method:
                return val
        return ''

    @property
    def payment_status(self):
        for key, val in self.STATUS:
            if key == self.status:
                return val
        return ''


class ForumTopic(models.Model):
    competition = models.ForeignKey(Competition, related_name='topics')
    user = models.ForeignKey(Account, related_name='topics')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    approved = models.BooleanField(default=False)
    closed = models.BooleanField(default=False)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            tp = ForumTopic.objects.filter(title=self.title)
            if tp.exists():
                self.slug += '-%s' % tp.count()

        super(ForumTopic, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title


class TopicAttachment(models.Model):
    topic = models.ForeignKey(ForumTopic, related_name='attachments')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=generate_topic_upload_path)
    created = models.DateTimeField(auto_now_add=True)


@receiver(post_delete, sender=CompetitionData)
def user_attachment_delete_handler(sender, instance, **kwargs):
    storage, path = instance.attachment.storage, instance.attachment.path
    remove_file(path)


@receiver(post_delete, sender=Submission)
def submission_delete_handler(sender, instance, **kwargs):
    storage, path = instance.file.storage, instance.file.path
    remove_file(path)


@receiver(post_delete, sender=EvaluationCode)
def submission_delete_handler(sender, instance, **kwargs):
    storage, path = instance.file.storage, instance.file.path
    remove_file(path)
