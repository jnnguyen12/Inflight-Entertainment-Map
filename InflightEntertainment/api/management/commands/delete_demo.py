from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker
from django.utils import timezone

class Command(BaseCommand):
    def handle(self, *args, **options):
        flight = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        airports = Airport.objects.all().delete()
        mark = Marker.objects.filter(flight=flight).delete()
        flight.delete()