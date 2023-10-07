from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Flight, FlightRecord, CameraPosition, Marker, Airport
from .serializers import FlightSerializer, FlightRecordSerializer, CameraPositionSerializer, MarkerSerializer, AirportSerializer
from django.core.management import call_command
from django.utils import timezone
from datetime import datetime, timedelta


@api_view(['GET'])
def getRoutes(request):
    routes = [
        {
            'Endpoint': '/api/flight/id',
            'method': 'GET',
            'body': None,
            'description': 'Returns a json flights for given id.'
        }
    ]
    return Response(routes)

@api_view(['GET'])
def getFlights(request):
    flight = Flight.objects.all()
    serializer = FlightSerializer(flight, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getFlight(request, pk):
    flight = Flight.objects.get(flight_id=pk)
    serializer = FlightSerializer(flight, many=False)
    return Response(serializer.data)

@api_view(['GET'])
def simulateFlight(request, identifier):
    flight = get_object_or_404(Flight, Q(hex=identifier) | Q(flight=identifier))
    records = FlightRecord.objects.filter(flight=flight).order_by('timestamp')
    records_serializer = FlightRecordSerializer(records, many=True)
    
    return Response(records_serializer.data)

# Need to change CameraPosition to marker
@api_view(['FETCH', 'GET'])
def flyToMarkerPayload(request, markerID):
    marker = get_object_or_404(Marker, Q(id=markerID))
    ser = MarkerSerializer(marker)
    print("Backend sent flyToPosition: ", str(ser.data))
    return Response(ser.data)
    
# Need to add marker ID -- or just use the flight as ID?
@api_view(['FETCH', 'GET'])
def addMarker(request, type, identifier):
    if(type == "aircraft"):
        flight_key = get_object_or_404(Flight, Q(hex=identifier) | Q(flight=identifier))
        record = FlightRecord.objects.all().filter(flight=flight_key).order_by('timestamp')[0]
        marker = Marker(
            type="aircraft",
            name=flight_key.hex,
            flight = flight_key,
            timestamp=record.timestamp,
            lat=record.lat,
            lng=record.lng
        )
    else:
        airport = get_object_or_404(Airport, Q(hex=identifier) | Q(flight=identifier))
        marker = Marker(
            type="airport",
            name=airport.name,
            flight = flight_key,
            timestamp=record.timestamp,
            lat=airport.lat,
            lng=airport.lng
        )
    marker.save()
    ser = MarkerSerializer(marker)
    print(f"addMarker call: creating marker {ser}, {ser.data}")
    return Response(ser.data)

# This updates marker based on FlightRecords from json
@api_view(['GET'])
def updateMarker(request, identifier):
    marker = get_object_or_404(Marker, Q(id=identifier))
    ser = MarkerSerializer(marker)
    print(f"UPDATE MARKER: marker {marker}, ser {ser.data['timestamp']}")
    format = "%Y-%m-%dT%H:%M:%S.%fZ"
    new_time = datetime.strptime(ser.data['timestamp'], format) + timedelta(seconds=60)
    # Need to change this to not rely on matching timestamps
    record = FlightRecord.objects.get(flight=marker.flight, 
                                               timestamp__gte=new_time - timedelta(seconds=1),
                                               timestamp__lte=new_time + timedelta(seconds=1))
    marker.timestamp = record.timestamp
    marker.lat = record.lat
    marker.lng = record.lng
    marker.save(update_fields=["lat", "lng", "timestamp"])
    ser = MarkerSerializer(marker)

    return Response(ser.data)



global lat_step
global lng_step
lat_step = 0
lng_step = 0

# This simulates a flight without using FlightRecords
@api_view(['GET'])
def updateDemo(request):
    # flight_key = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
    marker = get_object_or_404(Marker)
    global lat_step
    global lng_step
    if(marker.lat < 41.9928 and marker.lng < -93.6215):
        marker.lat += lat_step
        marker.lng += lng_step
    marker.timestamp = datetime.now()
    marker.save(update_fields=["lat", "lng", "timestamp"])
    ser = MarkerSerializer(marker)
    print(f'lat diff: {lat_step}, lng diff: {lng_step}')
    return Response(ser.data)

@api_view(['GET'])
def startDemo(request):
    flight = Flight(hex='DEMO', flight="DEMO")
    flight.save()
    timestamp = datetime.now()
    marker = Marker(type='aircraft', lat=41.5341, lng=-93.6634, flight=flight, timestamp=timestamp)
    a1 = Airport(id=1, name="Des Moines Airport", lat=41.5341, lng=-93.6634)
    a2 = Airport(id=2, name="Ames Airport", lat=41.9928, lng=-93.6215)
    a1.save()
    a2.save()
    marker.save()
    s1 = AirportSerializer(a1)
    s2 = AirportSerializer(a2)
    s3 = MarkerSerializer(marker)

    lat1 = 41.5341
    lat2 = 41.9928
    lng1 = -93.6634
    lng2 = -93.6215
    lat_diff = lat2 - lat1
    lng_diff = lng2 - lng1
    global lat_step
    global lng_step
    lat_step = lat_diff / 20
    lng_step = lng_diff / 20
    print(f'startDemo: {lat_step}, {lng_step}')

    response = [s1.data, s2.data, s3.data]
    return Response(response)

# TODO: Add API call for drawing the line (based on flight ID / airports, return line coords)
@api_view(['GET'])
def getLine(request, flightID):
    flight_key = get_object_or_404(Flight, Q(hex=flightID) | Q(flight=flightID))
