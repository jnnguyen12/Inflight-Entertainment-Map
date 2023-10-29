from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord
from datetime import datetime

class Command(BaseCommand):
    def handle(self, *args, **options):
        airports = Airport.objects.all()
        timestamp = datetime.now()
        for a in airports:
            marker = Marker(type='airport', lat=a.lat, lng=a.lng, airport=a, timestamp=timestamp)
            marker.save()