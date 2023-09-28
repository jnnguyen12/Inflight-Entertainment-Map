from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Flight, FlightRecord, CameraPosition, FlightMarker, Airport
from .serializers import FlightSerializer, FlightRecordSerializer, CameraPositionSerializer, FlightMarkerSerializer, AirportSerializer
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

# Not sure we need to worry about FETCH
@api_view(['FETCH', 'GET', 'POST'])
def flyToMarkerPayload(request):
    # should remove POST option me thinks
    if request.method == 'POST':
        call_command('create_camera_pos', )
        return
    else:
        pos = CameraPosition.objects.get()
        ser = CameraPositionSerializer(pos)
        print("Backend sent flyToPosition: ", str(ser.data))
        return Response(ser.data)
    
# Need to add marker ID -- or just use the flight as ID?
@api_view(['FETCH', 'GET'])
def addFlightMarker(request, identifier):
    # Could move creation to a command
    flight_key = get_object_or_404(Flight, Q(hex=identifier) | Q(flight=identifier))
    #start_date = datetime(2022)
    record = FlightRecord.objects.all().filter(flight=flight_key).order_by('timestamp')[0]
    marker = FlightMarker(
        flight = flight_key,
        timestamp=record.timestamp,
        lat=record.lat,
        lng=record.lng
    )
    marker.save()
    ser = FlightMarkerSerializer(marker)
    print(f"addFlight call: creating marker {ser}, {ser.data}")
    return Response(ser.data)

# This updates marker based on FlightRecords from json
@api_view(['GET'])
def updateFlightMarker(request, identifier):
    flight_key = get_object_or_404(Flight, Q(hex=identifier) | Q(flight=identifier))
    marker = get_object_or_404(FlightMarker, Q(flight=flight_key))
    ser = FlightMarkerSerializer(marker)
    print(f"UPDATE MARKER: marker {marker}, ser {ser.data['timestamp']}")
    format = "%Y-%m-%dT%H:%M:%S.%fZ"
    new_time = datetime.strptime(ser.data['timestamp'], format) + timedelta(seconds=60)
    # Need to change this to not rely on matching timestamps
    record = FlightRecord.objects.get(flight=flight_key, 
                                               timestamp__gte=new_time - timedelta(seconds=1),
                                               timestamp__lte=new_time + timedelta(seconds=1))
    marker.timestamp = record.timestamp
    marker.lat = record.lat
    marker.lng = record.lng
    marker.save(update_fields=["lat", "lng", "timestamp"])
    ser = FlightMarkerSerializer(marker)

    return Response(ser.data)



global lat_step
global lng_step
lat_step = 0
lng_step = 0

# This simulates a flight without using FlightRecords
@api_view(['GET'])
def updateDemo(request):
    flight_key = get_object_or_404(Flight, Q(hex='DEMO') | Q(flight='DEMO'))
    marker = get_object_or_404(FlightMarker, Q(flight=flight_key))
    global lat_step
    global lng_step
    if(marker.lat < 41.9928 and marker.lng < -93.6215):
        marker.lat += lat_step
        marker.lng += lng_step
    marker.timestamp = datetime.now()
    marker.save(update_fields=["lat", "lng", "timestamp"])
    ser = FlightMarkerSerializer(marker)
    print(f'lat diff: {lat_step}, lng diff: {lng_step}')
    return Response(ser.data)

@api_view(['GET'])
def startDemo(request):
    flight = Flight(hex='DEMO', flight="DEMO")
    flight.save()
    timestamp = datetime.now()
    marker = FlightMarker(id=3, lat=41.5341, lng=-93.6634, flight=flight, timestamp=timestamp)
    a1 = Airport(id=1, name="Des Moines Airport", lat=41.5341, lng=-93.6634)
    a2 = Airport(id=2, name="Ames Airport", lat=41.9928, lng=-93.6215)
    a1.save()
    a2.save()
    marker.save()
    s1 = AirportSerializer(a1)
    s2 = AirportSerializer(a2)
    s3 = FlightMarkerSerializer(marker)

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

