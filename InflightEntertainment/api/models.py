from django.db import models

# Create your models here.

# TODO: Rename to aircraft
class Flight(models.Model):
    hex = models.CharField(max_length=10, unique=True)  # Hex ID of the flight
    flight = models.CharField(max_length=20)  # Flight number
    r = models.CharField(max_length=10)  # Registration
    t = models.CharField(max_length=10)  # Aircraft type
    
    def __str__(self):
        return self.flight
    
class FlightRecord(models.Model):
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()  # Timestamp of the record
    lat = models.FloatField()  # Latitude
    lng = models.FloatField()  # Longitude
    alt_baro = models.IntegerField(null=True, blank=True)  # Barometric Altitude
    alt_geom = models.IntegerField(null=True, blank=True)  # Geometric Altitude
    track = models.FloatField(null=True, blank=True)  # Track
    gs = models.FloatField(null=True, blank=True)  # Ground Speed

    class Meta:
        unique_together = ['flight', 'timestamp']  # Each record must be unique per flight and timestamp
    
    def __str__(self):
        return f"{self.flight.flight} - {self.timestamp}"

class Airport(models.Model):
    id = models.AutoField(primary_key=True)
    ident = models.CharField(max_length=10)
    type = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return f"id: {self.id}, name: {self.name}, lat: {self.lat}, lng: {self.lng}"
    
class Marker(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=20)
    flight = models.ForeignKey(Flight, on_delete=models.SET_NULL, blank=True, null=True)
    airport = models.ForeignKey(Airport, on_delete=models.SET_NULL, blank=True, null=True)
    timestamp = models.DateTimeField()  # Timestamp of the record
    lat = models.FloatField()
    lng = models.FloatField()
    onMap = models.BooleanField(default=False)
    flyTo = models.BooleanField(default=False)
    toRemove = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}, type: {self.type}, lat: {self.lat}, lng: {self.lng}"
    
class Polyline(models.Model):
    aircraftID = models.IntegerField(null=True)
    airportIDTo = models.IntegerField(null=True)
    airportIDFrom = models.IntegerField(null=False)
    onMap = models.BooleanField(default=False)
    toRemove = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}"