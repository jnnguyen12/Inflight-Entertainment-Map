from rest_framework import serializers
from .models import Flight, FlightRecord, CameraPosition, FlightMarker

class FlightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightRecord
        fields = ['lat', 'lng', 'timestamp', 'alt_baro', 'alt_geom', 'track', 'gs']

class FlightSerializer(serializers.ModelSerializer):
    records = FlightRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flight
        fields = ['hex', 'flight', 'r', 't', 'records']

class CameraPositionSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    zoom = serializers.IntegerField()

class FlightMarkerSerializer(serializers.ModelSerializer):
    flight = FlightSerializer(many=False, read_only=True)
    
    class Meta:
        model = FlightMarker
        fields = ['flight', 'timestamp', 'lat', 'lng']