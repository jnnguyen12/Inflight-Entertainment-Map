from rest_framework import serializers
from .models import Flight, FlightRecord, Marker, Airport, Polyline

class FlightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightRecord
        fields = ['lat', 'lng', 'timestamp', 'alt_baro', 'alt_geom', 'track', 'gs']

class FlightSerializer(serializers.ModelSerializer):
    records = FlightRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flight
        fields = ['hex', 'flight', 'r', 't', 'records']

# class CameraPositionSerializer(serializers.Serializer):
#     lat = serializers.FloatField()
#     lng = serializers.FloatField()
#     zoom = serializers.IntegerField()

class AirportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    ident = serializers.CharField()
    type = serializers.CharField()
    name = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()

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