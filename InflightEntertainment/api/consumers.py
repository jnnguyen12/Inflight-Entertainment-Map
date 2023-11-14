# import json
# from channels.generic.websocket import WebsocketConsumer
# from asgiref.sync import async_to_sync
# from .models import Flight, FlightRecord
# from datetime import datetime


# class FlightConsumer(WebsocketConsumer):
#     def connect(self):
#         self.room_group_name = 'test'

#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,
#             self.channel_name
#         )

#         self.accept()

#     def receive(self, text_data):
#         print("Received data:", text_data)
#         text_data_json = json.loads(text_data)
#         flight_data = text_data_json.get('flight')
#         print("Extracted flight data:", flight_data)
#         record_data = text_data_json.get('record')
#         if text_data_json.get('type') == 'new_flight_record':
#             flight, created = Flight.objects.get_or_create(
#                 hex=flight_data['hex'],
#                 defaults={
#                     'flight': flight_data['flight'],
#                     'r': flight_data['r'],
#                     't': flight_data['t'],
#                 }
#             )

#             FlightRecord.objects.create(
#                 flight=flight,
#                 timestamp=datetime.fromisoformat(record_data['timestamp']),
#                 lat=record_data['lat'],
#                 lng=record_data['lng'],
#                 alt_baro=record_data.get('alt_baro'),
#                 alt_geom=record_data.get('alt_geom'),
#                 track=record_data.get('track'),
#                 ground_speed=record_data.get('ground_speed')
#             )
#             self.send(text_data=json.dumps({
#                 'type': 'new_flight_record',
#                 'flight': {
#                       'hex': flight.hex,
#                       'flight': flight.flight,
#                         'r': flight.r,
#                         't': flight.t
#                       },
#                 'record': {
#                     'timestamp': record_data['timestamp'],
#                     'lat': record_data['lat'],
#                     'lng': record_data['lng']
#                 }
#             }))
#             async_to_sync(self.channel_layer.group_send)(
#                 self.room_group_name,
#                 {
#                     'type': 'new_flight_record',
#                     'flight': {
#                         'flight': flight_data['flight']
#                     },
#                     'record': {
#                         'timestamp': record_data['timestamp'],
#                         'lat': record_data['lat'],
#                         'lng': record_data['lng']
#                     }
#                 }
#             )
#         elif text_data_json.get('type') == 'add_flight_record':
#             try:
#                 flight = Flight.objects.get(hex=flight_data['hex'])
#             except Flight.DoesNotExist:
#                 print("Flight not found with hex:", flight_data['hex'])
#                 return

#             FlightRecord.objects.create(
#                 flight=flight,
#                 timestamp=datetime.fromisoformat(record_data['timestamp']),
#                 lat=record_data['lat'],
#                 lng=record_data['lng'],
#                 alt_baro=record_data.get('alt_baro'),
#                 alt_geom=record_data.get('alt_geom'),
#                 track=record_data.get('track'),
#                 ground_speed=record_data.get('ground_speed')
#             )

#             print(f"Added flight record for existing flight: {flight.flight}")

#             async_to_sync(self.channel_layer.group_send)(
#                 self.room_group_name,
#                 {
#                     'type': 'add_flight_record',
#                     'flight': {
#                         'flight': flight.flight
#                     },
#                     'record': {
#                         'timestamp': record_data['timestamp'],
#                         'lat': record_data['lat'],
#                         'lng': record_data['lng']
#                     }
#                 }
#             )

#             # Send response back to the WebSocket client
#             self.send(text_data=json.dumps({
#                 'type': 'add_flight_record',
#                 'flight': {
#                     'hex': flight.hex,
#                     'flight': flight.flight,
#                     'r': flight.r,
#                     't': flight.t
#                 },
#                 'record': {
#                     'timestamp': record_data['timestamp'],
#                     'lat': record_data['lat'],
#                     'lng': record_data['lng']
#                 }
#             }))

#     def add_flight_record(self, event):
#         self.send(text_data=json.dumps(event))

#     def new_flight_record(self, event):
#         self.send(text_data=json.dumps(event))


import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import Flight, Airport, Marker, Polyline
from .serializers import FlightSerializer
from datetime import datetime
from math import sin, cos, sqrt, atan2, radians
from time import strftime

class FlightConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def calculate_distance_in_km(self, origin_lat, origin_lng, destination_lat, destination_lng):
        def to_radians(degrees):
            return degrees * (3.141592653589793 / 180)
        R = 6371  # Earth's radius in kilometers
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

    def calculate_progress(total_distance, remaining_distance):
        if total_distance <= 0 or remaining_distance < 0:
            print('Invalid input: total_distance and remaining_distance must be positive numbers.')
            return 0
        progress = ((total_distance - remaining_distance) / total_distance) * 100
        return max(0, min(100, progress)) # Ensure progress is within the range [0, 100]

    def setFlight(self, data):
        origin = data.get('airportOrigin')
        originData, created = Airport.objects.update_or_create(
            identifier=origin['identifier'],
            type=origin['type'],
            nameAbbreviated=origin['nameAbbreviated'],
            lat=origin['lat'],
            lng=origin['lng'],
            time=origin['time']
        )
        originData.save()

        destination=data.get('airportDestination')
        destinationData, created = Airport.objects.update_or_create(
            identifier=destination['identifier'],
            type=destination['type'],
            nameAbbreviated=destination['nameAbbreviated'],
            lat=destination['lat'],
            lng=destination['lng'],
            time=destination['time']
        )
        destinationData.save()
        
        totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
        flight = data.get('flight')
        flightData, created = Flight.objects.update_or_create(
                hex=flight['hex'],
                flight= flight['flight'],
                timestamp= datetime.fromisoformat(flight['timestamp']),
                lat= flight['lat'],
                lng= flight['lng'],
                registration= flight['r'],
                aircraftType= flight['t'],
                alt_baro= flight['alt_baro'],
                alt_geom= flight['alt_geom'],
                track= flight['track'],
                ground_speed= flight['gs'],
                airportOrigin= originData,
                airportDestination= destinationData,
                totalDistance= totalDistance
        )
        if(created): 
            print("Created new object!")
        else:
            print("Now new obj to create")
        flightData.save()
        

        payload = {
                'type': 'setFlight',
                'flight': data['flight']['flight'],
                'lat': data['flight']['lat'],
                'lng': data['flight']['lng'],
                'rotation': 0,
                'airportOrigin': {
                      'id': originData.id,
                      'name': originData.name,
                      'nameAbbreviated': originData.nameAbbreviated,
                      'lat': originData.lat,
                      'lng': originData.lng,
                      'time': originData.time.strftime("%m/%d/%Y, %H:%M:%S")
                },
                'airportDestination': {
                    'id': destinationData.id,
                    'name': destinationData.name,
                    'nameAbbreviated': destinationData.nameAbbreviated,
                    'lat': destinationData.lat,
                    'lng': destinationData.lng,
                    'time': destinationData.time.strftime("%m/%d/%Y, %H:%M:%S")
                },
                'ground_speed': data['flight']['gs'],
                'progress': 0,
                'travaledKm': 0,
                'remainingKm': totalDistance
            }
        
        # self.send(data=json.dumps(payload))
        
    #     ser = FlightSerializer(flightData)
    #     # payload = {
    #     #     'type': 'setFlight',
    #     #     ser.data
    #     # }

    #     temp = ser.data
    #    # temp['type'] = 'setFlight'
    #     print(f"Before dumps: \n{temp}")
    #     text_data = json.dumps(temp)

    #     print(f"\nAfter dumps: \n{temp}")
    #     text_data = '{\n "type": "setFlight",\n\t' + text_data[1:]

    #     print(f"After string modificatoin: \n{text_data}")
        self.send(text_data=json.dumps(payload))
        print("\nmade it past send")

        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
    
    def updateFlight(self, data):
        originData = self.handleAirport(data.get('airportOrigin'))
        destinationData = self.handleAirport(data.get('airportDestination'))
        
        flightData, created=Flight.objects.update_or_create(
                hex=data['hex'],
                flight = data['flight'],
                timestamp=datetime.fromisoformat(data['timestamp']),
                lat=data['lat'],
                lng=data['lng'],
                registration=data['r'],
                aircraftType=data['t'],
                alt_baro=data['alt_baro'],
                alt_geom=data['alt_geom'],
                track=data['track'],
                ground_speed=data['gs'],
                airportOrigin=originData,
                airportDestination=destinationData
        )
        
        remainingKm = self.calculate_distance_in_km(data.lat, data.lng, destinationData.lat, destinationData.lng)
        travaledKm = self.calculate_distance_in_km(originData.lat, originData.lng, data.lat, data.lng)
        progress = self.calculate_progress(flightData.totalDistance, remainingKm)
        payload = {
                'type': 'updateFlight',
                'flight': data['flight'],
                'lat': data['lat'],
                'lng': data['lng'],
                'rotation': 0,
                'airportOrigin': {
                      'name': originData.name,
                      'nameAbbreviated': originData.nameAbbreviated,
                      'lat': originData.lat,
                      'lng': originData.lng,
                      'time': originData.time
                },
                'airportDestination': {
                    'name': destinationData.name,
                    'nameAbbreviated': destinationData.nameAbbreviated,
                    'lat': destinationData.lat,
                    'lng': destinationData.lng,
                    'time': destinationData.time
                },
                'ground_speed': data['gs'],
                'progress': progress,
                'travaledKm': travaledKm,
                'remainingKm': remainingKm
            }
        
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
     
    def removeFlight(self, data):
        # TODO Make sure this removes the data
        flightData = Flight.objects.get(data['hex'])
        payload = {
            'type': 'removeFlight',
            'id': data['hex'],
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
    
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
        # TODO Check if this is correct  
        markerType = data['param'] 
        if markerType == 'aircraft':
            originData = self.handleAirport(data.get('airportOrigin'))
            destinationData = self.handleAirport(data.get('airportDestination'))
            totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
            flightData, created =Flight.objects.update_or_create(
                    hex=data['hex'],
                    flight = data['flight'],
                    timestamp=datetime.fromisoformat(data['timestamp']),
                    lat=data['lat'],
                    lng=data['lng'],
                    registration=data['r'],
                    aircraftType=data['t'],
                    alt_baro=data['alt_baro'],
                    alt_geom=data['alt_geom'],
                    track=data['track'],
                    ground_speed=data['gs'],
                    airportOrigin=originData,
                    airportDestination=destinationData,
                    totalDistance=totalDistance
            )
            thisID = flightData.hex
            
        elif markerType == 'airport':
            airportdata = self.handleAirport(data.get('airport'))
            Marker.objects.get_or_create(
                type=data['param'],
                flight=airportdata,
                timestamp=data['timestamp'],
                lat=airportdata.lat,
                lng=airportdata.lng,
                onMap=True,               
            ) 
        
        payload = {
            'type': 'addMarker',
            'id': thisID,
            'param': data['param'],
            'lat': data['lat'],
            'lng': data['lng'],
            'rotation': data.get('rotation', 0)
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
        
    def removeMarker(self, data):
        # TODO Check if this is correct  
        MarkerData = Marker.objects.get(data['id'])
        MarkerData.onMap = False
        MarkerData.toRemove = True       
        payload = {
            'type': 'removeMarker',
            'id': data['id'],
            'param': data['param']
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)

    def updateMarker(self, data):
        # TODO Check if this is correct  
        markerType = data['param'] 
        if markerType == 'aircraft':
            originData = self.handleAirport(data.get('airportOrigin'))
            destinationData = self.handleAirport(data.get('airportDestination'))
            totalDistance = self.calculate_distance_in_km(originData.lat, originData.lng, destinationData.lat, destinationData.lng)
            flightData, created =Flight.objects.update_or_create(
                    hex=data['hex'],
                    flight = data['flight'],
                    timestamp=datetime.fromisoformat(data['timestamp']),
                    lat=data['lat'],
                    lng=data['lng'],
                    registration=data['r'],
                    aircraftType=data['t'],
                    alt_baro=data['alt_baro'],
                    alt_geom=data['alt_geom'],
                    track=data['track'],
                    ground_speed=data['gs'],
                    airportOrigin=originData,
                    airportDestination=destinationData,
                    totalDistance=totalDistance
            )
            thisID = flightData.hex
            
        elif markerType == 'airport':
            airportData = self.handleAirport(data.get('airport'))

            Marker.objects.get_or_create(
                id=airportData.id,
                type=data['param'],
                flight=airportData,
                timestamp=data['timestamp'],
                lat=airportData.lat,
                lng=airportData.lng,
                onMap=True,               
            ) 
            thisID = airportData.id
        
        payload = {
            'type': 'updateMarker',
            'id': thisID,
            'lat': data['lat'],
            'lng': data['lng'],
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
        
    def addPolyline(self, data):
        # TODO Check if this is correct
        aircraft = Flight.objects.get(data['hex'])
        airportOrigin = Airport.objects.get(data['airportOriginId'])
        airportDestination = Airport.objects.get(data['airportDestinationId'])
        polyLineData, created = Polyline.objects.update_or_create(
            aircraftID=aircraft.hex,
            airportIDTo=airportDestination.id,
            airportIDFrom=airportOrigin.id,
            onMap=True
        )
        payload = {
            'type': 'addPolyline',
            'aircraftId': polyLineData.aircraftID,
            'airportIdTo': polyLineData.airportIDTo,
            'airportIdFrom': polyLineData.airportIDFrom,
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)
        
    def removePolyline(self, data):
        # TODO Check if this is correct
        polyline = Polyline.objects.get(data['id'])
        polyline.onMap = False
        polyline.save
        payload = {
            'type': 'removePolyline',
            'id': data['data'],
            'param': 'polyline',
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)

    def clearMap(self, data):
        # TODO Clear database 
        payload = {
            'type': 'clearMap',
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)

    def wellness(self, data):
        # TODO Check if correct 
        payload = {
            'type': 'wellness',
            'param': data['wellness']
        }
        self.send(data=json.dumps(payload))
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, payload)      
    
    def receive(self, text_data):
        print("Received data:", text_data)
        text_data_json = json.loads(text_data)
        flight_data = text_data_json.get('flight')
        print("Extracted flight data:", flight_data)
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

    def handleAirport(self, data):
        airportData, created = Airport.objects.update_or_create(
            identifier=data['identifier'],
            type=data['type'],
            nameAbbreviated=data['nameAbbreviated'],
            lat=data['lat'],
            lng=data['lng'],
            time=data['time']
        )
        airportData.save()
        return airportData
        
        
        # if text_data_json.get('type') == 'new_flight_record':
        #     flight, created = Flight.objects.get_or_create(
        #         hex=flight_data['hex'],
        #         defaults={
        #             'flight': flight_data['flight'],
        #             'r': flight_data['r'],
        #             't': flight_data['t'],
        #         }
        #     )

        #     FlightRecord.objects.create(
        #         flight=flight,
        #         timestamp=datetime.fromisoformat(record_data['timestamp']),
        #         lat=record_data['lat'],
        #         lng=record_data['lng'],
        #         alt_baro=record_data.get('alt_baro'),
        #         alt_geom=record_data.get('alt_geom'),
        #         track=record_data.get('track'),
        #         ground_speed=record_data.get('ground_speed')
                
        #     )
            
            
        #     self.send(text_data=json.dumps({
        #         'type': 'new_flight_record',
        #         'flight': {
        #               'hex': flight.hex,
        #               'flight': flight.flight,
        #                 'r': flight.r,
        #                 't': flight.t
        #               },
        #         'record': {
        #             'timestamp': record_data['timestamp'],
        #             'lat': record_data['lat'],
        #             'lng': record_data['lng']
        #         }
        #     }))
        #     async_to_sync(self.channel_layer.group_send)(
        #         self.room_group_name,
        #         {
        #             'type': 'new_flight_record',
        #             'flight': {
        #                 'flight': flight_data['flight']
        #             },
        #             'record': {
        #                 'timestamp': record_data['timestamp'],
        #                 'lat': record_data['lat'],
        #                 'lng': record_data['lng']
        #             }
        #         }
        #     )
        # elif text_data_json.get('type') == 'add_flight_record':
    #         try:
    #             flight = Flight.objects.get(hex=flight_data['hex'])
    #         except Flight.DoesNotExist:
    #             print("Flight not found with hex:", flight_data['hex'])
    #             return

    #         FlightRecord.objects.create(
    #             flight=flight,
    #             timestamp=datetime.fromisoformat(record_data['timestamp']),
    #             lat=record_data['lat'],
    #             lng=record_data['lng'],
    #             alt_baro=record_data.get('alt_baro'),
    #             alt_geom=record_data.get('alt_geom'),
    #             track=record_data.get('track'),
    #             ground_speed=record_data.get('ground_speed')
    #         )

    #         print(f"Added flight record for existing flight: {flight.flight}")

    #         async_to_sync(self.channel_layer.group_send)(
    #             self.room_group_name,
    #             {
    #                 'type': 'add_flight_record',
    #                 'flight': {
    #                     'flight': flight.flight
    #                 },
    #                 'record': {
    #                     'timestamp': record_data['timestamp'],
    #                     'lat': record_data['lat'],
    #                     'lng': record_data['lng']
    #                 }
    #             }
    #         )

    #         # Send response back to the WebSocket client
    #         self.send(text_data=json.dumps({
    #             'type': 'add_flight_record',
    #             'flight': {
    #                 'hex': flight.hex,
    #                 'flight': flight.flight,
    #                 'r': flight.r,
    #                 't': flight.t
    #             },
    #             'record': {
    #                 'timestamp': record_data['timestamp'],
    #                 'lat': record_data['lat'],
    #                 'lng': record_data['lng']
    #             }
    #         }))

    
    # # def add_flight_record(self, event):
    # #     self.send(text_data=json.dumps(event))

    # # def new_flight_record(self, event):
    # #     self.send(text_data=json.dumps(event))

