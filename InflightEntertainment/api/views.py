from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Flight, Marker, Airport, Polyline
from .serializers import FlightSerializer, MarkerSerializer, PolylineSerializer
from django.core.management import call_command
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import HttpResponse
from timezonefinder import TimezoneFinder

### THESE ENDPOINTS ARE DEPRECATED 
### ALL FUNCTIONALITY IS CURRENTLY THROUGH WEBSOCKETS
### see consumers.py for websocket backend
### Previous this was the the endpoints should do for the REST API

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

# @api_view(['GET'])
# def simulateFlight(request, identifier):
#     flight = get_object_or_404(Flight, Q(hex=identifier) | Q(flight=identifier))
#     records = FlightRecord.objects.filter(flight=flight).order_by('timestamp')
#     records_serializer = FlightRecordSerializer(records, many=True)
    
#     return Response(records_serializer.data)

@api_view(['GET'])
def flyToMarkerID(request, markerID):
    marker = get_object_or_404(Marker, Q(id=markerID))
    ser = MarkerSerializer(marker)
    print("Backend sent flyToMarkerID: ", str(ser.data))
    return Response(ser.data)

@api_view(['GET'])
def flyToLastMarker(request):
    try:
        marker = Marker.objects.get(flyTo=True)
    except:
        return HttpResponse(status=204) #No content
    
    marker.flyTo = False
    marker.save()
    ser = MarkerSerializer(marker)
    temp = ser.data
    temp["zoom"] = 11
    print("Backend flyToLastMarker: ", str(temp))
    return Response(temp)
    

@api_view(['FETCH', 'GET'])
def addMarker(request):
    try:
        markers = Marker.objects.all().filter(onMap=False)
    except:
        return HttpResponse(status=204)
    
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
    try:
        marker = Marker.objects.get(type='aircraft')
    except:
        return HttpResponse(status=204)
    
    ser = MarkerSerializer(marker)
    return Response(ser.data)


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


@api_view(['GET'])
def addPolyline(request):
    polylines = Polyline.objects.all().filter(onMap=False)
    data = []
    for p in polylines:
        p.onMap = True
        p.save(update_fields=["onMap"])
        ser = PolylineSerializer(p)
        data.append(ser.data)
        print(ser.data)
    return Response(data)

@api_view(['GET'])
def removePolyline(request):
    try:
        polylines = Polyline.objects.all().filter(toRemove=True)
    except:
        return HttpResponse(status=204)
    
    data = []
    for p in polylines:
        ser = PolylineSerializer(p)
        data.append(ser.data)
        p.delete()
    return Response(data)

@api_view(['GET'])
def getTimezone(request):
    try:
        latitude = float(request.GET.get('lat'))
        longitude = float(request.GET.get('lon'))
    except (TypeError, ValueError):
        return Response({"error": "Invalid latitude or longitude"}, status=400)

    tf = TimezoneFinder()
    timezone_str = tf.timezone_at(lat=latitude, lng=longitude)

    if timezone_str:
        return Response({"timezone": timezone_str})
    else:
        return Response({"error": "Timezone not found"}, status=404)
# @api_view(['GET'])
# def wellnessCheck(request):
#     return Response("airports")

# @api_view(['POST'])
# def getFrontendData(request, data):
