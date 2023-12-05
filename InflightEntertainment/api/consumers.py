
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import Flight, Airport, Marker, Polyline
from .serializers import FlightSerializer
from datetime import datetime
from math import sin, cos, sqrt, atan2, radians
from time import strftime
from django.db.models import Q
from django.shortcuts import get_object_or_404

class BackendConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'back'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        # print(self.room_group_name)
        # print(self.channel_name)
        self.accept()

    def disconnect(self, event):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def message(self, payload):
        self.send(json.dumps(payload))

    def calculate_distance_in_km(self, origin_lat, origin_lng, destination_lat, destination_lng):
        def to_radians(degrees):
            return degrees * (3.141592653589793 / 180)
        R = 6371  # Earth's radius in kilometers
        origin_lat = float(origin_lat)
        destination_lat = float(destination_lat)
        origin_lng = float(origin_lng)
        destination_lng = float(destination_lng)

        d_lat = to_radians(destination_lat - origin_lat)
        d_lon = to_radians(destination_lng - origin_lng)
        a = (
            sin(d_lat / 2) * sin(d_lat / 2) +
            cos(to_radians(origin_lat)) * cos(to_radians(destination_lat)) *
            sin(d_lon / 2) * sin(d_lon / 2)
        )
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c  # Distance in kilometers
        return distance

    def calculate_progress(self, total_distance, remaining_distance):
        if total_distance <= 0 or remaining_distance < 0:
            print('Invalid input: total_distance and remaining_distance must be positive numbers.')
            return 0
        progress = ((total_distance - remaining_distance) / total_distance) * 100
        return max(0, min(100, progress)) # Ensure progress is within the range [0, 100]

    def handleAirport(self, data):
        airportData, created = Airport.objects.update_or_create(
            identifier=data['identifier'],
            airportType=data['airportType'],
            nameAbbreviated=data['nameAbbreviated'],
            lat=data['lat'],
            lng=data['lng'],
            time=data['time']
        )
        airportData.save()
        return airportData

    # TODO: Need to handle markers, polylines, landmarks as well.
    def loadFront(self, data):
        try: 
            originData = get_object_or_404(Airport, airportType='Origin')
            destinationData = get_object_or_404(Airport, airportType='Destination')
            flightData = Flight.objects.get()
            totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        except Exception as e:
            print(f"Failed to find existing flight in loadFront: {e}")
            return
        
        payload = {
            'type': 'setFlight',
            'flight': flightData.flight,
            'id': flightData.hex,
            'lat': flightData.lat,
            'lng': flightData.lng,
            'alt_baro': flightData.alt_baro,
            'alt_geom': flightData.alt_geom,
            'track': flightData.track,
            'rotation': 0,
            'ground_speed': flightData.ground_speed,
            'progress': 0,
            'aircraftType': flightData.aircraftType,
            'registration': flightData.registration,
            'travaledKm': 0,
            'remainingKm': totalDistance,
            'airportOrigin': {
                    'id': originData.id,
                    'identifier': originData.identifier,
                    'name': originData.name,
                    'airportType': originData.airportType,
                    'nameAbbreviated': originData.nameAbbreviated,
                    'lat': originData.lat,
                    'lng': originData.lng,
                    'time': str(originData.time)
            },
            'airportDestination': {
                'id': destinationData.id,
                'identifier': destinationData.identifier,
                'name': destinationData.name,
                'airportType': destinationData.airportType,
                'nameAbbreviated': destinationData.nameAbbreviated,
                'lat': destinationData.lat,
                'lng': destinationData.lng,
                'time': str(destinationData.time)
            }
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    def setFlight(self, data):
        origin = data.get('airportOrigin')
        originData, created = Airport.objects.update_or_create(
            identifier=origin.get('identifier'),
            airportType=origin.get('airportType'),
            nameAbbreviated=origin['nameAbbreviated'],
            lat=origin['lat'],
            lng=origin['lng'],
        )
        originData.save()

        destination=data.get('airportDestination')
        destinationData, created = Airport.objects.update_or_create(
            identifier=destination['identifier'],
            airportType=destination['airportType'],
            nameAbbreviated=destination['nameAbbreviated'],
            lat=destination['lat'],
            lng=destination['lng'],
        )
        destinationData.save()
        
        totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        print(f"Total Distance -- set flight: {totalDistance}")
        flight = data.get('flight')
        flightData, created = Flight.objects.update_or_create(
                hex=flight.get('hex'),
                flight= flight['flight'],
                defaults = {
                    'hex': flight.get('hex'),
                    'flight': flight['flight'],
                    'lat': flight['lat'],
                    'lng': flight['lng'],
                    'registration': flight['registration'],
                    'aircraftType': flight['aircraftType'],
                    'alt_baro': flight['alt_baro'],
                    'alt_geom': flight['alt_geom'],
                    'track': flight['track'],
                    'ground_speed': flight['ground_speed'],
                    'airportOrigin': originData,
                    'airportDestination': destinationData,
                    'totalDistance': totalDistance,
                }
        )
        flightData.totalDistance = totalDistance
        flightData.save(update_fields=['totalDistance'])
        print(f"Total Distance -- flightData: {totalDistance}")

        if(created): 
            print("Created new object!")
        else:
            print("No new obj to create")
        flightData.save()
        

        payload = {
            'type': 'setFlight',
            'flight': flightData.flight,
            'id': flightData.hex,
            'lat': flightData.lat,
            'lng': flightData.lng,
            'alt_baro': flightData.alt_baro,
            'alt_geom': flightData.alt_geom,
            'track': flightData.track,
            'rotation': 0,
            'ground_speed': flightData.ground_speed,
            'progress': 0,
            'aircraftType': flightData.aircraftType,
            'registration': flightData.registration,
            'travaledKm': 0,
            'remainingKm': totalDistance,
            'airportOrigin': {
                    'id': originData.id,
                    'identifier': originData.identifier,
                    'name': originData.name,
                    'airportType': originData.airportType,
                    'nameAbbreviated': originData.nameAbbreviated,
                    'lat': originData.lat,
                    'lng': originData.lng,
                    'time': str(originData.time)
            },
            'airportDestination': {
                'id': destinationData.id,
                'identifier': destinationData.identifier,
                'name': destinationData.name,
                'airportType': destinationData.airportType,
                'nameAbbreviated': destinationData.nameAbbreviated,
                'lat': destinationData.lat,
                'lng': destinationData.lng,
                'time': str(destinationData.time)
            }
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
    
    def updateFlight(self, data):
        originData = self.handleAirport(data.get('airportOrigin'))
        destinationData = self.handleAirport(data.get('airportDestination'))
        
        flight = data.get('flight')
        flightData = get_object_or_404(Flight, Q(hex=flight['hex']))
        flightData.save()

        curTimestamp = data.get('currentTimestamp')
        prevTimestamp = data.get('prevTimestamp')
        totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        remainingKm = self.calculate_distance_in_km(flight.get('lat'), flight.get("lng"), destinationData.lat, destinationData.lng)
        traveledKm = self.calculate_distance_in_km(originData.lat, originData.lng, flight.get("lat"), flight.get("lng"))
        progress = self.calculate_progress(totalDistance, remainingKm)

        payload = {
            'type': 'updateFlight',
            'flight': flightData.flight,
            'id': flightData.hex,
            'lat': flight.get("lat"),
            'lng': flight.get("lng"),
            'alt_baro': flight.get("alt_baro"),
            'alt_geom': flight.get("alt_geom"),
            'track': flight.get("track"),
            'aircraftType': flightData.aircraftType,
            'registration': flightData.registration,
            'ground_speed': flight.get("ground_speed"),
            'rotation': 0,
            'prevTimestamp': str(prevTimestamp),
            'currentTimestamp': str(curTimestamp),
            'progress': progress,
            'traveledKm': traveledKm,
            'remainingKm': remainingKm,
            'airportOrigin': {
                    'identifier': originData.identifier,
                    'name': originData.name,
                    'airportType': originData.airportType,
                    'nameAbbreviated': originData.nameAbbreviated,
                    'lat': originData.lat,
                    'lng': originData.lng,
                    'time': str(originData.time)
            },
            'airportDestination': {
                'identifier': destinationData.identifier,
                'name': destinationData.name,
                'airportType': destinationData.airportType,
                'nameAbbreviated': destinationData.nameAbbreviated,
                'lat': destinationData.lat,
                'lng': destinationData.lng,
                'time': str(destinationData.time)
            }
        }
        
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
     
    def removeFlight(self, data):
        # TODO Make sure this removes the data
        flight = data.get('flight')
        flightData = get_object_or_404(Flight, Q(hex=flight['hex']))

        payload = {
            'type': 'removeFlight',
            'id': flight.get('hex'),
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
    
    def flyToLocation(self, data):
        payload = {
            'type': 'flyToLocation',
            'lat': data['lat'],
            'lng': data['lng'],
            'zoom': data['zoom']
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)

    def addMarker(self, data):
        marker = data.get('marker')
        type = marker.get('param')
        markerObj = None

        if type == 'aircraft':
            markerObj, etc = Marker.objects.get_or_create(
                type='aircraft',
                flight = marker.get('flight'),
                lat=marker.get('lat'),
                lng=marker.get('lng'),
            )
        elif type == 'airport':
            markerObj, etc = Marker.objects.get_or_create(
                type='airport',
                airport=marker.get('airport'),
                lat=marker.get('lat'),
                lng=marker.get('lng'),
            ) 
        elif type == 'landmark':
            markerObj, etc = Marker.objects.get_or_create(
                type='landmark',
                landmark=marker.get('landmark'),
                lat=marker.get('lat'),
                lng=marker.get('lng'),
            ) 

        markerObj.save()
        
        payload = {
            'type': 'addMarker',
            'marker': {
                'id': markerObj.id,
                'param': marker.get('param'),
                'lat': marker.get('lat'),
                'lng': marker.get('lng'),
                'rotation': marker.get('rotation')
            }
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
        
    def removeMarker(self, data):
        try:
            Marker.objects.get(id=data['id']).delete()
        except:
            print("In removeMarker -- couldn't find Marker to remove.")
            return
        
        payload = {
            'type': 'removeMarker',
            'id': data['id'],
            'param': data['param']
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    def updateMarker(self, data):
        marker = data.get('marker')
        markerType = marker.get('param') 

        #update record in DB
        record = get_object_or_404(Marker, id=marker.get('id'))
        record.lat = marker.get('lat')
        record.lng = marker.get('lng')
        record.save(update_fields=['lat', 'lng'])            
        
        payload = {
            'type': 'updateMarker',
            'id': marker.get('id'),
            'lat': marker.get('lat'),
            'lng': marker.get('lng'),
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    def addPolyline(self, data):
        # TODO Check if this is correct
        aircraft = Flight.objects.get(hex=data['hex'])
        airportOrigin = aircraft.airportOrigin
        airportDestination = aircraft.airportDestination

        polyLineData, created = Polyline.objects.update_or_create(
            aircraftID=aircraft.hex,
            airportIDTo=airportDestination.id,
            airportIDFrom=airportOrigin.id,
        )
        polyLineData.save()
        payload = {
            'type': 'addPolyline',
            'aircraftId': aircraft.hex,
            'airportIdTo': airportOrigin.id,
            'airportIdFrom': airportDestination.id,
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
        
    def removePolyline(self, data):
        # TODO Check if this is correct
        polyline = Polyline.objects.get(data['id'])
        polyline.delete()

        payload = {
            'type': 'removePolyline',
            'id': data['data'],
            'param': 'polyline',
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)

    def clearMap(self, data):
        # Delete from DB
        Flight.objects.all().delete()
        Marker.objects.all().delete()
        Airport.objects.all().delete()

        # Tell front to delete from map
        payload = {
            'type': 'clearMap',
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    def wellness(self, data):
        payload = {
            'type': 'wellness',
            'param': data['param']
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )    
    
    def receive(self, text_data):
        print("Received data:", text_data, "\n")
        text_data_json = json.loads(text_data)
        #print("JSON: ", text_data_json)
        flight_data = text_data_json.get('flight')
        #print("Extracted flight data:", flight_data)
        record_data = text_data_json.get('record')
        if text_data_json.get('type') == "setFlight":
            self.setFlight(text_data_json)
        elif text_data_json.get('type') == "updateFlight":
            self.updateFlight(text_data_json)
        elif text_data_json.get('type') == "removeFlight":
            self.removeFlight(text_data_json)
        elif text_data_json.get('type') == "flyToLocation":
            self.flyToLocation(text_data_json)
        elif text_data_json.get('type') == "addMarker":
            self.addMarker(text_data_json)
        elif text_data_json.get('type') == "removeMarker":
            self.removeMarker(text_data_json)
        elif text_data_json.get('type') == "updateMarker":
            self.updateMarker(text_data_json)
        elif text_data_json.get('type') == "addPolyline":
            self.addPolyline(text_data_json)
        elif text_data_json.get('type') == "removePolyline":
            self.removePolyline(text_data_json)
        elif text_data_json.get('type') == "clearMap":
            self.clearMap(text_data_json)
        elif text_data_json.get('type') == "wellness":
            self.wellness(text_data_json)
        elif text_data_json.get('type') == "loadFront":
            self.loadFront(text_data_json)
        else:
            print("No handler for this message.")
