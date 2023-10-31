import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import Flight, FlightRecord
from datetime import datetime


class FlightConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        print("Received data:", text_data)
        text_data_json = json.loads(text_data)
        flight_data = text_data_json.get('flight')
        print("Extracted flight data:", flight_data)
        record_data = text_data_json.get('record')
        if text_data_json.get('type') == 'new_flight_record':
            flight, created = Flight.objects.get_or_create(
                hex=flight_data['hex'],
                defaults={
                    'flight': flight_data['flight'],
                    'r': flight_data['r'],
                    't': flight_data['t'],
                }
            )

            FlightRecord.objects.create(
                flight=flight,
                timestamp=datetime.fromisoformat(record_data['timestamp']),
                lat=record_data['lat'],
                lng=record_data['lng'],
                alt_baro=record_data.get('alt_baro'),
                alt_geom=record_data.get('alt_geom'),
                track=record_data.get('track'),
                ground_speed=record_data.get('ground_speed')
            )
            self.send(text_data=json.dumps({
                'type': 'new_flight_record',
                'flight': {
                      'hex': flight.hex,
                      'flight': flight.flight,
                        'r': flight.r,
                        't': flight.t
                      },
                'record': {
                    'timestamp': record_data['timestamp'],
                    'lat': record_data['lat'],
                    'lng': record_data['lng']
                }
            }))
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'new_flight_record',
                    'flight': {
                        'flight': flight_data['flight']
                    },
                    'record': {
                        'timestamp': record_data['timestamp'],
                        'lat': record_data['lat'],
                        'lng': record_data['lng']
                    }
                }
            )
        elif text_data_json.get('type') == 'add_flight_record':
            try:
                flight = Flight.objects.get(hex=flight_data['hex'])
            except Flight.DoesNotExist:
                print("Flight not found with hex:", flight_data['hex'])
                return

            FlightRecord.objects.create(
                flight=flight,
                timestamp=datetime.fromisoformat(record_data['timestamp']),
                lat=record_data['lat'],
                lng=record_data['lng'],
                alt_baro=record_data.get('alt_baro'),
                alt_geom=record_data.get('alt_geom'),
                track=record_data.get('track'),
                ground_speed=record_data.get('ground_speed')
            )

            print(f"Added flight record for existing flight: {flight.flight}")

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'add_flight_record',
                    'flight': {
                        'flight': flight.flight
                    },
                    'record': {
                        'timestamp': record_data['timestamp'],
                        'lat': record_data['lat'],
                        'lng': record_data['lng']
                    }
                }
            )

            # Send response back to the WebSocket client
            self.send(text_data=json.dumps({
                'type': 'add_flight_record',
                'flight': {
                    'hex': flight.hex,
                    'flight': flight.flight,
                    'r': flight.r,
                    't': flight.t
                },
                'record': {
                    'timestamp': record_data['timestamp'],
                    'lat': record_data['lat'],
                    'lng': record_data['lng']
                }
            }))

    def add_flight_record(self, event):
        self.send(text_data=json.dumps(event))

    def new_flight_record(self, event):
        self.send(text_data=json.dumps(event))
