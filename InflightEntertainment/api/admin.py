from django.contrib import admin

# Register your models here.

from .models import Flight, FlightRecord, CameraPosition, FlightMarker, Airport

admin.site.register(Flight)
admin.site.register(FlightRecord)
admin.site.register(CameraPosition)
admin.site.register(FlightMarker)
admin.site.register(Airport)