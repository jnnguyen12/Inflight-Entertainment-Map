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
        parser.add_argument('flight', type=str, nargs='?', default="ACA765")
        parser.add_argument('hex_key', type=str, nargs="?", default="c07c7b")
        parser.add_argument('time', type=int, nargs='?', default=600) #5 hours

    def clearDemo(self, **options):
        print("Exiting demo -- deleting objects.")
        time.sleep(4)

        hex_key = options.get('hex_key')
        flightSign = options.get('flight')
        flight = get_object_or_404(Flight, Q(hex=hex_key) | Q(flight=flightSign))

        markers = Marker.objects.all().filter(flight=flight)
        for m in markers:
            m.toRemove = True
            m.save(update_fields=['toRemove'])

        #flight.delete()

    def handle(self, *args, **options):
        # Create objects
        print("Commencing demo -- creating objects")
        hex_key = options.get('hex_key')
        flightSign = options.get('flight')

        try: 
            flight_key = get_object_or_404(Flight, Q(hex=hex_key))
        except:
            flight_key = Flight(hex=hex_key, flight=flightSign)
            flight_key.save()

        start = FlightRecord.objects.all().order_by("-timestamp")[0]
        flight_marker = Marker(type='aircraft', lat=start.lat, lng=start.lng, flight=flight_key, timestamp=start.timestamp, flyTo=True, rotation=start.rotation)
        flight_marker.save()

        # Loop through records
        print("Looping through flight records")      
        records = FlightRecord.objects.all().filter(flight=flight_key)
        for rec in records:
            time.sleep(0.5)
            flight_marker.lat = rec.lat
            flight_marker.lng = rec.lng
            flight_marker.timestamp = rec.timestamp
            flight_marker.rotation = rec.rotation
            flight_marker.save(update_fields=['lat', 'lng', 'timestamp'])
            print(f"| Flight {flight_key.flight} | Lat: {rec.lat} | Lng: {rec.lng} | Timestamp: {rec.timestamp}")

        self.clearDemo(**options)

