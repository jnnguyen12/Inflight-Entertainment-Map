from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker
from django.utils import timezone
from django.views import *

class Command(BaseCommand):
    def handle(self, *args, **options):
        Marker.objects.all().filter(type='airport').delete()
        Airport.objects.all().delete()