from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord, Polyline
from django.utils import timezone

from datetime import datetime
import time

# Creates flight between ames and des moines airports and updates DB
class Command(BaseCommand):
    
    def __init__(self):
        self.lat_step = None
        self.lng_step = None

    def clearDemo(self):
        print("Exiting demo -- deleting objects.")
        flight = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        a1 = get_object_or_404(Airport, Q(name='Ames Airport'))
        a2 = get_object_or_404(Airport, Q(name='Des Moines Airport'))

        #markers = Marker.objects.filter(Q(flight=flight) | Q(airport=a1) | Q(airport=a2))
        markers = Marker.objects.all()
        for m in markers:
            m.toRemove = True
            m.save()

        a1.delete()
        a2.delete()
        flight.delete()
        Polyline.objects.all().delete()

    def loopDemo(self):
        print("Looping through demo flight path")
        flight_key = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        marker = get_object_or_404(Marker, Q(flight=flight_key))
        while(True):
            time.sleep(3)
            if(marker.lat < 41.9928 and marker.lng < -93.6215):
                marker.lat += self.lat_step
                marker.lng += self.lng_step
                marker.timestamp = datetime.now()
                marker.save(update_fields=["lat", "lng", "timestamp"])
            else:
                self.clearDemo()
                break
        

    def handle(self, *args, **options):
        print("Commencing demo -- creating objects")

        flight = Flight(hex='DEMO', flight="DEMO")
        timestamp = datetime.now()
        markerFlight = Marker(type='aircraft', lat=41.5341, lng=-93.6634, flight=flight, timestamp=timestamp, flyTo=True)
        a1 = Airport(id=1, name="Des Moines Airport", lat=41.5341, lng=-93.6634)
        markerA1 = Marker(type='airport', lat=41.5341, lng=-93.6634, airport=a1, timestamp=timestamp)
        a2 = Airport(id=2, name="Ames Airport", lat=41.9928, lng=-93.6215)
        markerA2 = Marker(type='airport', lat=41.9928, lng=-93.6215, airport=a2, timestamp=timestamp)

        a1.save()
        markerA1.save()
        a2.save()
        markerA2.save()
        flight.save()
        markerFlight.save()

        polyline = Polyline(aircraftID=markerFlight.id, airportIDTo=markerA2.id)
        polyline.save()

        lat1 = 41.5341
        lat2 = 41.9928
        lng1 = -93.6634
        lng2 = -93.6215
        lat_diff = lat2 - lat1
        lng_diff = lng2 - lng1
        self.lat_step = lat_diff / 10
        self.lng_step = lng_diff / 10

        self.loopDemo()
