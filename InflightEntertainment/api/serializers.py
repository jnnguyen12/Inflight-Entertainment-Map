from rest_framework import serializers
from .models import Flight, Marker, Airport, Polyline

# class FlightRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FlightRecord
#         fields = ['lat', 'lng', 'timestamp', 'alt_baro', 'alt_geom', 'track', 'ground_speed']

    

# class CameraPositionSerializer(serializers.Serializer):
#     lat = serializers.FloatField()
#     lng = serializers.FloatField()
#     zoom = serializers.IntegerField()

class AirportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    identifier = serializers.CharField()
    type = serializers.CharField()
    name = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()

class FlightSerializer(serializers.ModelSerializer):
    airportOrigin = AirportSerializer(many=False)
    airportDestination = AirportSerializer(many=False)

    class Meta:
        model = Flight
        fields = ['id', 'flight', 'lat', 'lng', 'registration',
                  'airportOrigin', 'airportDestination', 'aircraftType',
                  'alt_geom', 'alt_baro', 'ground_speed', 'track', 'totalDistance']

class MarkerSerializer(serializers.ModelSerializer):
    flight = FlightSerializer(many=False, read_only=True)
    airport = AirportSerializer(many=False, read_only=True)
    
    class Meta:
        model = Marker
        fields = ['id', 'flight', 'airport', 'type', 'timestamp', 'lat', 'lng']

class PolylineSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Polyline
        fields = ['aircraftID', 'airportIDTo', 'airportIDFrom']