from django.contrib import admin

# Importing models from the current directory's models.py file
from .models import Flight, Marker, Airport, Polyline, FlightRecord

# The admin.site.register function is used to add models to the Django admin interface.
# This makes it possible to view, add, modify, and delete entries for these models via the admin site.

# Registering the Flight model.
# This will allow the admin to manage Flight records through the admin interface. This is the same for the rest of the registers
admin.site.register(Flight)
admin.site.register(FlightRecord)
# admin.site.register(CameraPosition)
admin.site.register(Marker)
admin.site.register(Airport)
admin.site.register(Polyline)