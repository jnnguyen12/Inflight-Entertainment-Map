from django.core.management.base import BaseCommand
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Flight, Airport, Marker, FlightRecord
from datetime import datetime
import websockets.sync.client
import json
import time

class Command(BaseCommand):
    def handle(self, *args, **options):
        airports = Airport.objects.all()
        timestamp = datetime.now()
        ws = websockets.sync.client.connect("ws://127.0.0.1:8000/ws/socket-server/")

        for a in airports:
            marker = Marker(type='airport', lat=a.lat, lng=a.lng, airport=a, id=a.id)
            marker.save()
            payload = {  
            "type": "addMarker",
                "marker": {
                    "param": "airport",
                    "identifier": a.identifier,
                    "airportType": a.airportType,
                    "name": a.name,
                    "nameAbbreviated": a.nameAbbreviated,
                    "lat": a.lat,
                    "lng": a.lng,
                    "rotation": "0"
                }
            }
            
            ws.send(json.dumps(payload))
            time.sleep(0.1)
        ws.close()
