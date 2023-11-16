from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord, Polyline
from django.utils import timezone

from datetime import datetime
import time

from websockets.sync.client import connect

from channels.generic.websocket import WebsocketConsumer
# from api.consumers import consumers

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
        ws = connect("ws://127.0.0.1:8000/ws/socket-server/")
        
        # Initialize demo
        try: 
            flight_key = get_object_or_404(Flight, Q(hex=hex_key))
        except:
            flight_key = Flight(hex=hex_key, flight=flightSign)
            flight_key.save()

        start = FlightRecord.objects.all().order_by("-timestamp")[0]
        end = FlightRecord.objects.all().order_by("-timestamp")[-1]
        airportOrigin = Airport(
            identifier = "DEMO1",
            airportType = "Commercial",
            name = "John Hopkins Airport",
            nameAbbreviated = "JHA",
            lat = start.lat,
            lng = start.lng,
            time = start.timestamp
        )
        airportDest = Airport(
            identifier = "DEMO2",
            airportType = "Commercial",
            name = "Mary Collins Airport",
            nameAbbreviated = "MCA",
            lat = end.lat,
            lng = end.lng,
            time = end.timestamp
        )
        airportOrigin.save()
        airportDest.save()

        payload = {
            'type': 'setFlight',
            'flight': {
                'flight': flight_key.flight,
                'hex': flight_key.hex,
                'lat': flight_key.lat,
                'lng': flight_key.lng,
                'alt_baro': flight_key.alt_baro,
                'alt_geom': flight_key.alt_geom,
                'track': flight_key.track,
                'rotation': 0,
                'ground_speed': flight_key.ground_speed,
                'aircraftType': flight_key.aircraftType,
                'registration': flight_key.registration,
            },
            'airportOrigin': {
                    'identifier': airportOrigin.identifier,
                    'name': airportOrigin.name,
                    'airportType': airportOrigin.airportType,
                    'nameAbbreviated': airportOrigin.nameAbbreviated,
                    'lat': airportOrigin.lat,
                    'lng': airportOrigin.lng,
                    'time': airportOrigin.time
            },
            'airportDestination': {
                'identifier': airportDest.identifier,
                'name': airportDest.name,
                'airportType': airportDest.airportType,
                'nameAbbreviated': airportDest.nameAbbreviated,
                'lat': airportDest.lat,
                'lng': airportDest.lng,
                'time': airportDest.time
            }
        }
        ws.send(payload)

        # Loop through records
        print("Looping through flight records")      
        records = FlightRecord.objects.all().filter(flight=flight_key)
        for rec in records:
            time.sleep(0.5)
            flight_key.lat = rec.lat
            flight_key.lng = rec.lng
            flight_key.timestamp = rec.timestamp
            flight_key.rotation = rec.rotation
            flight_key.save()
            flight_key.alt_baro = rec.alt_baro
            flight_key.alt_geom = rec.alt_geom
            flight_key.ground_speed = rec.ground_speed
            
            print(f"| Flight {flight_key.flight} | Lat: {rec.lat} | Lng: {rec.lng} | Timestamp: {rec.timestamp}")
            payload = {
                'type': 'updateFlight',
                'flight': {
                    'flight': flight_key.flight,
                    'hex': flight_key.hex,
                    'lat': flight_key.lat,
                    'lng': flight_key.lng,
                    'alt_baro': flight_key.alt_baro,
                    'alt_geom': flight_key.alt_geom,
                    'track': flight_key.track,
                    'rotation': 0,
                    'ground_speed': flight_key.ground_speed,
                    'aircraftType': flight_key.aircraftType,
                    'registration': flight_key.registration,
                },
                'airportOrigin': {
                        'identifier': airportOrigin.identifier,
                        'name': airportOrigin.name,
                        'airportType': airportOrigin.airportType,
                        'nameAbbreviated': airportOrigin.nameAbbreviated,
                        'lat': airportOrigin.lat,
                        'lng': airportOrigin.lng,
                        'time': airportOrigin.time
                },
                'airportDestination': {
                    'identifier': airportDest.identifier,
                    'name': airportDest.name,
                    'airportType': airportDest.airportType,
                    'nameAbbreviated': airportDest.nameAbbreviated,
                    'lat': airportDest.lat,
                    'lng': airportDest.lng,
                    'time': airportDest.time
                },
                'currentTimestamp': rec.timestamp,
                'prevTimestamp': lastRec.timestamp
            }
            ws.send(payload)
            
            lastRec = rec
        self.clearDemo(**options)

