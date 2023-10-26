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

    def add_arguments(self, parser):
        parser.add_argument('lat1', type=float, nargs='?', default=41.5341)
        parser.add_argument('lat2', type=float, nargs='?', default=41.9928)
        parser.add_argument('lng1', type=float, nargs='?', default=-93.6634)
        parser.add_argument('lng2', type=float, nargs='?', default=-93.6215)

    def clearDemo(self):
        print("Exiting demo -- deleting objects.")
        flight = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        a1 = get_object_or_404(Airport, Q(name='Demo Airport 1'))
        a2 = get_object_or_404(Airport, Q(name='Demo Airport 2'))

        #markers = Marker.objects.filter(Q(flight=flight) | Q(airport=a1) | Q(airport=a2))
        markers = Marker.objects.all()
        for m in markers:
            m.toRemove = True
            m.save()

        a1.delete()
        a2.delete()
        flight.delete()
        Polyline.objects.all().delete()

    def loopDemo(self, **options):
        print("Looping through demo flight path")
        lat1 = options.get('lat1')
        lat2 = options.get('lat2')
        lng1 = options.get('lng1')
        lng2 = options.get('lng2')

        #Determine direction
        y_dir = 1 if lat1 < lat2 else -1
        x_dir = 1 if lng1 < lng2 else -1
        

        flight_key = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
        marker = get_object_or_404(Marker, Q(flight=flight_key))
        while(True):
            time.sleep(3)
            if(not(marker.lat > lat2 - 0.05 and marker.lat < lat2 + 0.05 and marker.lng > lng2 - 0.005 and marker.lng < lng2 + 0.005)):
                marker.lat += self.lat_step * y_dir
                marker.lng += self.lng_step * x_dir
                marker.timestamp = datetime.now()
                marker.save(update_fields=["lat", "lng", "timestamp"])
            else:
                self.clearDemo()
                break
        

    def handle(self, *args, **options):
        print("Commencing demo -- creating objects")
        lat1 = options.get('lat1')
        lat2 = options.get('lat2')
        lng1 = options.get('lng1')
        lng2 = options.get('lng2')

        flight = Flight(hex='DEMO', flight="DEMO")
        timestamp = datetime.now()
        markerFlight = Marker(type='aircraft', lat=lat1, lng=lng1, flight=flight, timestamp=timestamp, flyTo=True)
        a1 = Airport(id=1, name="Demo Airport 1", lat=lat1, lng=lng1)
        markerA1 = Marker(type='airport', lat=lat1, lng=lng1, airport=a1, timestamp=timestamp)
        a2 = Airport(id=2, name="Demo Airport 2", lat=lat2, lng=lng2)
        markerA2 = Marker(type='airport', lat=lat2, lng=lng2, airport=a2, timestamp=timestamp)

        a1.save()
        markerA1.save()
        a2.save()
        markerA2.save()
        flight.save()
        markerFlight.save()

        polyline = Polyline(aircraftID=markerFlight.id, airportID=markerA2.id)
        polyline.save()

        lat_diff = lat2 - lat1
        lng_diff = lng2 - lng1
        self.lat_step = lat_diff / 20
        self.lng_step = lng_diff / 20

        self.loopDemo(**options)
