from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord, Polyline
from django.utils import timezone

from datetime import datetime
import time

from channels.generic.websocket import WebsocketConsumer

# Creates flight between ames and des moines airports and updates DB
class Command(BaseCommand):

    # def __init__(self):
    #     self.client = FlightConsumer(WebsocketConsumer)
    #     self.client.connect()


    def add_arguments(self, parser):
        parser.add_argument('flight', type=str, nargs='?', default="KAL074")
        parser.add_argument('time', type=int, nargs='?', default=600) #5 hours

    def clearDemo(self):
        print("Exiting demo -- deleting objects.")
        flight = get_object_or_404(Flight, Q(hex='71ba08') | Q(flight='KAL074'))

        markers = Marker.objects.all().filter(flight=flight)
        for m in markers:
            m.toRemove = True
            m.save(update_fields=['toRemove'])

        #flight.delete()

    def handle(self, *args, **options):
        # Create objects
        print("Commencing demo -- creating objects")

        try: 
            flight_key = get_object_or_404(Flight, Q(hex='71ba08'))
        except:
            flight_key = Flight(hex='71ba08', flight="KAL074")
            flight_key.save()

        start = FlightRecord.objects.all().order_by("-timestamp")[0]
        flight_marker = Marker(type='aircraft', lat=start.lat, lng=start.lng, flight=flight_key, timestamp=start.timestamp, flyTo=True, rotation=start.rotation)
        flight_marker.save()

        # Loop through records
        print("Looping through flight records")      
        records = FlightRecord.objects.all().filter(flight=flight_key)
        for rec in records:
            time.sleep(1)
            flight_marker.lat = rec.lat
            flight_marker.lng = rec.lng
            flight_marker.timestamp = rec.timestamp
            flight_marker.rotation = rec.rotation
            flight_marker.save(update_fields=['lat', 'lng', 'timestamp'])
            print(f"| Flight {flight_key.flight} | Lat: {rec.lat} | Lng: {rec.lng} | Timestamp: {rec.timestamp}")

        self.clearDemo()

