from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.getRoutes, name="routes"),
    path('flights/', views.getFlights, name="flights"),
    path('flights/<str:pk>/', views.getFlight, name="flights"),
    path('flights/<str:identifier>/simulate/', views.simulateFlight, name="flights")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)