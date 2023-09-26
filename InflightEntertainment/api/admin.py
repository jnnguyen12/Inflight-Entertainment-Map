from django.contrib import admin

# Register your models here.

from .models import Flight, FlightRecord

admin.site.register(Flight)
admin.site.register(FlightRecord)