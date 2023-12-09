from rest_framework import serializers
from .models import Flight, Marker, Airport, Polyline

# This file uses Django REST framework serializers to convert complex data types, like querysets and model instances, 
# to Python data types that can then be easily rendered into JSON, XML, or other content types.

# class FlightRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FlightRecord
#         fields = ['lat', 'lng', 'timestamp', 'alt_baro', 'alt_geom', 'track', 'ground_speed']

    

# class CameraPositionSerializer(serializers.Serializer):
#     lat = serializers.FloatField()
#     lng = serializers.FloatField()
#     zoom = serializers.IntegerField()

# Serializer for the Airport model.
# Serializers define the API representation of model data.
class AirportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    identifier = serializers.CharField()
    type = serializers.CharField()
    name = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()

# Serializer for the Flight model using ModelSerializer for convenience.
# ModelSerializer includes simple default implementations of create() and update().
class FlightSerializer(serializers.ModelSerializer):
    # Nested serializers to represent the related Airport objects
    airportOrigin = AirportSerializer(many=False)
    airportDestination = AirportSerializer(many=False)

    class Meta:
        model = Flight # Specifies the model to serialize
        # Specifies the fields to be included in the serialized output
        fields = ['id', 'flight', 'lat', 'lng', 'registration',
                  'airportOrigin', 'airportDestination', 'aircraftType',
                  'alt_geom', 'alt_baro', 'ground_speed', 'track', 'totalDistance']

# Serializer for the Marker model using ModelSerializer
class MarkerSerializer(serializers.ModelSerializer):
    # Nested serializers to represent the related Flight and Airport objects
    flight = FlightSerializer(many=False, read_only=True)
    airport = AirportSerializer(many=False, read_only=True)
    
    class Meta:
        model = Marker # Specifies the model to serialize
        # Specifies the fields to be included in the serialized output
        fields = ['id', 'flight', 'airport', 'type', 'timestamp', 'lat', 'lng']

# Serializer for the Polyline model using ModelSerializer
class PolylineSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Polyline # Specifies the model to serialize
        # Specifies the fields to be included in the serialized output
        fields = ['aircraftID', 'airportIDTo', 'airportIDFrom']