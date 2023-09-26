from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Flight, FlightRecord, CameraPosition
from .serializers import FlightSerializer, FlightRecordSerializer, CameraPositionSerializer
from django.core.management import call_command


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

@api_view(['FETCH', 'GET', 'POST'])
def flyToMarkerPayload(request):
    if request.method == 'POST':
        call_command('create_camera_pos', )
        return
    else:
        pos = CameraPosition.objects.get()
        ser = CameraPositionSerializer(pos)
        print("Backend sent flyToPosition: ", str(ser.data))
        return Response(ser.data)