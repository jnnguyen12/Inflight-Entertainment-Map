from django.contrib import admin

# Register your models here.

from .models import Flight, Marker, Airport, Polyline

admin.site.register(Flight)
# admin.site.register(FlightRecord)
# admin.site.register(CameraPosition)
admin.site.register(Marker)
admin.site.register(Airport)
admin.site.register(Polyline)