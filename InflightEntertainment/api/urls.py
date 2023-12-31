from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

### THESE ENDPOINTS ARE DEPRECATED 
### ALL FUNCTIONALITY IS CURRENTLY THROUGH WEBSOCKETS
### see routing.py for websocket url
### Previous this was the endpoints for the REST API

urlpatterns = [
    path('', views.getRoutes, name="routes"),

    # Flights
    path('flights/', views.getFlights, name="flights"),
    path('flights/<str:pk>/', views.getFlight, name="flights"),
    # path('flights/<str:identifier>/simulate/', views.simulateFlight, name="flights"),

    # Markers
    path('<str:markerID>/flyToMarkerID/', views.flyToMarkerID, name="fly"),
    path('flyToLastMarker/', views.flyToLastMarker, name="fly"),
    path('addMarker/', views.addMarker, name="addMarker"),
    path('updateMarker/', views.updateMarker, name="updateMarker"),
    path('removeMarker/', views.removeMarker, name="removeMarker"),
    path('clearMarkers/', views.clearMarkers, name='clearMarkers'),
    
    # Polylines
    path('addPolylinePayload/', views.addPolyline, name="addPolyline"),
    path('removePolylinePayload/', views.removePolyline, name="removePolyline"),

    path('timezone/', views.getTimezone, name="getTimezone"),
#    path('WellnessCheck/', views.wellnessCheck, name="Wellness Check")
    
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)