
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
    # Handles WebSocket connection setup
    def connect(self):
        self.room_group_name = 'back'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        # print(self.room_group_name)
        # print(self.channel_name)
        # Accepts the WebSocket connection
        self.accept() 

    # Handles WebSocket disconnection
    def disconnect(self, event):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Sends a message to the WebSocket
    def message(self, payload):
        self.send(json.dumps(payload))

    # Calculates distance in kilometers between two geographical points 
    def calculate_distance_in_km(self, origin_lat, origin_lng, destination_lat, destination_lng):
        # Helper function to convert degrees to radians
        def to_radians(degrees):
            return degrees * (3.141592653589793 / 180)
        R = 6371  # Earth's radius in kilometers
        # Convert latitudes and longitudes from degrees to radians
        origin_lat = float(origin_lat)
        destination_lat = float(destination_lat)
        origin_lng = float(origin_lng)
        destination_lng = float(destination_lng)

        # Calculate differences in coordinates
        d_lat = to_radians(destination_lat - origin_lat)
        d_lon = to_radians(destination_lng - origin_lng)
        # formula to calculate distance
        a = (
            sin(d_lat / 2) * sin(d_lat / 2) +
            cos(to_radians(origin_lat)) * cos(to_radians(destination_lat)) *
            sin(d_lon / 2) * sin(d_lon / 2)
        )
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c  # Distance in kilometers
        return distance

    # Calculates progress percentage based on total and remaining distance
    def calculate_progress(self, total_distance, remaining_distance):
        # Ensure input distances are valid
        if total_distance <= 0 or remaining_distance < 0:
            print('Invalid input: total_distance and remaining_distance must be positive numbers.')
            return 0
        # Calculate progress as a percentage
        progress = ((total_distance - remaining_distance) / total_distance) * 100
        return max(0, min(100, progress)) # Ensure progress is within the range [0, 100]

    # Handles creation or update of airport records
    def handleAirport(self, data):
        # Create or update an airport record in the database
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
    # Loads initial flight data to the front-end upon connection
    def loadFront(self, data):
        try: 
            # Retrieve origin and destination airport data
            originData = get_object_or_404(Airport, airportType='Origin')
            destinationData = get_object_or_404(Airport, airportType='Destination')
            # Retrieve existing flight data
            flightData = Flight.objects.get()
            # Calculate total distance between origin and destination
            totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        except Exception as e:
            print(f"Failed to find existing flight in loadFront: {e}")
            return
        
        # Prepare payload to send flight data to the front-end
        payload = {
            'type': 'setFlight',
            'flight': flightData.flight,
            'id': flightData.id,
            'hex': flightData.hex,
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

        # Send the payload to the group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    # Sets flight data based on the provided data from the frontend
    def setFlight(self, data):
        # Create or update the origin and destination airports
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

        # Calculate the total distance between origin and destination airports
        totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        print(f"Total Distance -- set flight: {totalDistance}")
        # Update or create the flight data in the database
        flight = data.get('flight')
        flightData, created = Flight.objects.update_or_create(
                hex=flight.get('hex'),
                flight= flight.get('flight'),
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
        
        # Prepare payload with flight data to send back to the frontend
        payload = {
            'type': 'setFlight',
            'flight': flightData.flight,
            'id': flightData.id,
            'hex': flightData.hex,
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
        # Send the payload to the WebSocket channel group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    # Updates flight data based on the provided data from the frontend
    def updateFlight(self, data):
        # Handle airports and calculate distances similar to setFlight
        originData = self.handleAirport(data.get('airportOrigin'))
        destinationData = self.handleAirport(data.get('airportDestination'))
        
        # Retrieve the existing flight data from the database
        flight = data.get('flight')
        flightData = get_object_or_404(Flight, Q(hex=flight['hex']))
        flightData.save()

        curTimestamp = data.get('currentTimestamp')
        prevTimestamp = data.get('prevTimestamp')
        totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        remainingKm = self.calculate_distance_in_km(flight.get('lat'), flight.get("lng"), destinationData.lat, destinationData.lng)
        traveledKm = self.calculate_distance_in_km(originData.lat, originData.lng, flight.get("lat"), flight.get("lng"))
        progress = self.calculate_progress(totalDistance, remainingKm)

        # Prepare payload with updated flight data
        payload = {
            'type': 'updateFlight',
            'flight': flightData.flight,
            'id': flightData.id,
            'hex': flightData.hex,
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
            'simulationSpeedup': flight.get('simulationSpeedup'),
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

        # Send the payload to the WebSocket channel group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    # Removes a flight based on the provided data
    def removeFlight(self, data):
        # TODO Make sure this removes the data
        flight = data.get('flight')
        flightData = get_object_or_404(Flight, Q(hex=flight['hex']))

        # Prepare payload for removing the flight from the frontend
        payload = {
            'type': 'removeFlight',
            'id': flight.get('hex'),
        }

        # Send the payload to the WebSocket channel group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
    # Responds to a request to move the map's camera to a specific location
    def flyToLocation(self, data):
        # Prepare the payload with the requested location and zoom level
        payload = {
            'type': 'flyToLocation',
            'lat': data['lat'],
            'lng': data['lng'],
            'zoom': data['zoom']
        }
        # Send the payload to the frontend
        self.send(data=json.dumps(payload))
        # Broadcast the payload to the WebSocket channel group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
    
    # Adds a new marker based on the provided data
    def addMarker(self, data):
        # Extract the marker type and details
        marker = data.get('marker')
        type = marker.get('param')
        markerObj = None

        # Handle the creation of different types of markers (aircraft, airport, landmark)
        if type == 'aircraft':
            try: 
                originID = get_object_or_404(Airport, id=marker.get('airportOrigin'))
                destID = get_object_or_404(Airport, id=marker.get('airportDestination'))
            except:
                originID = None
                destID = None

            flight, created = Flight.objects.update_or_create(
                    hex=marker.get('hex'), 
                    defaults = {
                        'hex': marker.get('hex'),
                        'flight': marker.get('flight'),
                        'airportOrigin': originID,
                        'airportDestination': destID,
                        'lat': marker.get('lat'),
                        'lng': marker.get('lng')
                    }
            )
            markerObj, etc = Marker.objects.get_or_create(
                id=flight.id,
                type='aircraft',
                flight = flight,
                lat=marker.get('lat'),
                lng=marker.get('lng'),
            )

        elif type == 'airport':
            airport, created = Airport.objects.update_or_create(
                    identifier=marker.get('identifier'), 
                    defaults = {
                        'identifier': marker.get('identifier'),
                        'airportType': marker.get('airportType'),
                        'name': marker.get('name'),
                        'nameAbbreviated': marker.get('nameAbbreviated'),
                        'lat': marker.get('lat'),
                        'lng': marker.get('lng')
                    }
            )
            markerObj, etc = Marker.objects.get_or_create(
                id=airport.id,
                type='airport',
                airport=airport,
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
        # Save the created marker
        markerObj.save()
        
        # Prepare and send payload to confirm marker addition
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
        
    # Removes a marker based on the provided data
    def removeMarker(self, data):
        # Attempt to find and delete the specified marker
        try:
            Marker.objects.get(id=data['id']).delete()
        except:
            # Handle case where marker is not found
            print("In removeMarker -- couldn't find Marker to remove.")
            return

        # Prepare and send payload to confirm marker removal
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

    # Updates a marker's position based on the provided data
    def updateMarker(self, data):
        # Retrieve and update the marker details
        marker = data.get('marker')
        markerType = marker.get('param') 

        #update record in DB
        record = get_object_or_404(Marker, id=marker.get('id'))
        record.lat = marker.get('lat')
        record.lng = marker.get('lng')
        # Save the updated marker
        record.save(update_fields=['lat', 'lng'])            
        
        # Prepare and send payload to confirm marker update
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

    # TODO: All marker functions should work for flights, landmarks, and airports
    # Adds a polyline associated with an aircraft
    def addPolyline(self, data):
        # Retrieve and create polyline data
        aircraft = Flight.objects.get(id=data['aircraft'])
        airportOrigin = aircraft.airportOrigin
        airportDestination = aircraft.airportDestination

        polyLineData, created = Polyline.objects.update_or_create(
            aircraftID=aircraft.id,
            airportIDTo=airportDestination.id,
            airportIDFrom=airportOrigin.id,
        )

        # Save the polyline data
        polyLineData.save()

        # Prepare and send payload to confirm polyline addition
        payload = {
            'type': 'addPolyline',
            'aircraftId': aircraft.id,
            'airportIdTo': airportOrigin.id,
            'airportIdFrom': airportDestination.id,
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )
        
    # Removes a polyline based on the provided data
    def removePolyline(self, data):
        # Find and delete the specified polyline
        polyline = Polyline.objects.get(aircraftID=data.get('id'))
        polyline.delete()

        # Prepare and send payload to confirm polyline removal
        payload = {
            'type': 'removePolyline',
            'id': data.get('id'),
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    # Clears all markers, airports, and polylines from the map
    def clearMap(self, data):
        # Delete all relevant records from the database
        Marker.objects.all().delete()
        Airport.objects.all().delete()
        Polyline.objects.all().delete()

        # Send a message to the frontend to clear the map
        payload = {
            'type': 'clearMap',
        }

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )

    # Handles wellness check requests
    def wellness(self, data):
        # Prepare a payload for the wellness check
        payload = {
            'type': 'wellness',
            'param': data['param']
        }

        # Send the payload to the WebSocket channel group
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, 
            {
                'type': 'message',
                'command': payload
            }
        )    
    
    # Handles incoming WebSocket messages
    def receive(self, text_data):
        # Log the received data
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
