from rest_framework import serializers
from .models import Flight, FlightRecord

class FlightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightRecord
        fields = ['lat', 'lon', 'timestamp', 'alt_baro', 'alt_geom', 'track', 'gs']

class FlightSerializer(serializers.ModelSerializer):
    records = FlightRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flight
        fields = ['hex', 'flight', 'r', 't', 'records']