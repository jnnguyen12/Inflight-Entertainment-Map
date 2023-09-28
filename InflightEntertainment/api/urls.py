from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.getRoutes, name="routes"),
    path('flights/', views.getFlights, name="flights"),
    path('flights/<str:pk>/', views.getFlight, name="flights"),
    path('flights/<str:identifier>/simulate/', views.simulateFlight, name="flights"),
    path('flyToMarkerPayload/', views.flyToMarkerPayload, name="fly"), # change name?
    path('<str:identifier>/addMarker/', views.addFlightMarker, name="addMarker"),
    path('<str:identifier>/updateMarker/', views.updateFlightMarker, name="updateMarker"),
    path('startDemo/', views.startDemo, name="startDemo"),
    path('updateDemo/', views.updateDemo, name="updateDemo")
]