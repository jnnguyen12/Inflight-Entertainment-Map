from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Flight, FlightRecord, Marker, Airport, Polyline
from .serializers import FlightSerializer, FlightRecordSerializer, MarkerSerializer, PolylineSerializer
from django.core.management import call_command
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import HttpResponse


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

@api_view(['GET'])
def flyToMarkerID(request, markerID):
    marker = get_object_or_404(Marker, Q(id=markerID))
    ser = MarkerSerializer(marker)
    print("Backend sent flyToMarkerID: ", str(ser.data))
    return Response(ser.data)

@api_view(['GET'])
def flyToLastMarker(request):
    marker = Marker.objects.get(flyTo=True)
    marker.flyTo = False
    marker.save()

    ser = MarkerSerializer(marker)
    temp = ser.data
    temp["zoom"] = 11
    print("Backend flyToLastMarker: ", str(temp))
    return Response(temp)
    
# Need to add marker ID -- or just use the flight as ID?
@api_view(['FETCH', 'GET'])
def addMarker(request):
    markers = Marker.objects.all().filter(onMap=False)
    data = []
    for m in markers:
        m.onMap = True
        m.save(update_fields=["onMap"])
        ser = MarkerSerializer(m)
        data.append(ser.data)
    return Response(data)


# This just returns an updated flight for now, need to support multiple markers
#   as well as detecting when a marker has been changed
# Also need to re-implement the FlightRecord based approach (commented below)
@api_view(['FETCH', 'GET'])
def updateMarker(request):
    marker = Marker.objects.get(type='aircraft')
    ser = MarkerSerializer(marker)
    return Response(ser.data)

# # This updates marker based on FlightRecords from json
# @api_view(['GET'])
# def updateMarker(request):
#     marker = Marker.objects.all().filter(type='aircraft')
#     ser = MarkerSerializer(marker)
#     print(f"UPDATE MARKER: marker {marker}, ser {ser.data['timestamp']}")
#     format = "%Y-%m-%dT%H:%M:%S.%fZ"
#     new_time = datetime.strptime(ser.data['timestamp'], format) + timedelta(seconds=60)
#     # Need to change this to not rely on matching timestamps
#     # record = FlightRecord.objects.get(flight=marker.flight, 
#     #                                            timestamp__gte=new_time - timedelta(seconds=1),
#     #                                            timestamp__lte=new_time + timedelta(seconds=1))
#     marker.timestamp = record.timestamp
#     marker.lat = record.lat
#     marker.lng = record.lng
#     marker.save(update_fields=["lat", "lng", "timestamp"])
#     ser = MarkerSerializer(marker)

#     return Response(ser.data)

# Not sure what to return on these
@api_view(['GET'])
def removeMarker(request):
    markers = Marker.objects.filter(toRemove=True)
    data = []
    for m in markers:
        ser = MarkerSerializer(m)
        data.append(ser.data)
        m.delete()
    return Response(data)

@api_view(['GET'])
def clearMarkers(request):
    Marker.objects.all().delete()
    data = "Deleted all markers"
    return HttpResponse(data)


# TODO: dont return marker objects just return their IDs
@api_view(['GET'])
def addPolyline(request):
    lines = Polyline.objects.all().filter(onMap=False)
    data = []
    for p in lines:
        p.onMap = True
        p.save(update_fields=["onMap"])
        ser = PolylineSerializer(p)
        data.append(ser.data)
    return Response(data)

@api_view(['GET'])
def removePolyline(request):
    lines = Polyline.objects.all().filter(toRemove=True)
    data = []
    for p in lines:
        ser = PolylineSerializer(p)
        data.append(ser.data)
        p.delete()
    return Response(data)