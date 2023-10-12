from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker
from django.utils import timezone

class Command(BaseCommand):
    def handle(self, *args, **options):
        flight = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        a1 = get_object_or_404(Airport, Q(name='Ames Airport'))
        a2 = get_object_or_404(Airport, Q(name='Des Moines Airport'))
        Marker.objects.filter(flight=flight).delete()
        Marker.objects.filter(airport=a1).delete()
        Marker.objects.filter(airport=a2).delete()
        a1.delete()
        a2.delete()
        flight.delete()