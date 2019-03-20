from django.core.management.base import BaseCommand

from competitions.models import Submission


class Command(BaseCommand):
    def handle(self, *args, **options):
        submissions = Submission.objects.unprocessed_submissions()
        for submission in submissions:
            success, score, is_new, improved = Submission.objects.score_process(submission)
            print (success, score)

