from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord

class Command(BaseCommand):
    def handle(self, *args, **options):
        Flight.objects.all().delete()
        Marker.objects.all().delete()
        Airport.objects.all().delete()
        FlightRecord.objects.all().delete()