from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.getRoutes, name="routes"),

    # Flights
    path('flights/', views.getFlights, name="flights"),
    path('flights/<str:pk>/', views.getFlight, name="flights"),
    path('flights/<str:identifier>/simulate/', views.simulateFlight, name="flights"),

    # Markers
    path('<str:markerID>/flyToMarkerID/', views.flyToMarkerID, name="fly"),
    path('flyToLastMarker/', views.flyToLastMarker, name="fly"),
    path('addMarker/', views.addMarker, name="addMarker"),
    path('updateMarker/', views.updateMarker, name="updateMarker"),
    path('<str:identifier>/removeMarker/', views.removeMarker, name="removeMarker"),
    path('clearMarkers/', views.clearMarkers, name='clearMarkers'),
    

    # Demo
    # path('startDemo/', views.startDemo, name="startDemo"),
    # path('updateDemo/', views.updateDemo, name="updateDemo"),
    
]