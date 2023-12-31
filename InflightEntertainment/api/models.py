from django.db import models

# Create your models here for the database.

# Airport model to store information about different airports
class Airport(models.Model):
    identifier = models.CharField(max_length=10)
    airportType = models.CharField(max_length=20, null=True)
    name = models.CharField(max_length=20)
    nameAbbreviated = models.CharField(max_length=20, default='airport', null=True)
    lat = models.FloatField() # Latitude
    lng = models.FloatField() # Longitude
    time = models.DateTimeField(null=True, blank=True) # Time associated with the airport, can be null
    
    def __str__(self):
        return f"id: {self.id}, name: {self.name}, lat: {self.lat}, lng: {self.lng}"
    

class Flight(models.Model):
    hex = models.CharField(max_length=10, unique=True)          # Hex ID of the flight
    flight = models.CharField(max_length=20)                    # Flight number
    timestamp = models.DateTimeField(null=True)                          # Timestamp of the record
    lat = models.FloatField(default=0.0)                                   # Latitude
    lng = models.FloatField(default=0.0)                                   # Longitude
    registration = models.CharField(max_length=10, null=True)              # Registration
    aircraftType = models.CharField(max_length=10, null=True)              # Aircraft type
    alt_baro = models.CharField(null=True, blank=True, max_length=6)          # Barometric Altitude (altitude in feet as a number OR “ground”)
    alt_geom = models.IntegerField(null=True, blank=True)       # Geometric Altitude
    track = models.FloatField(null=True, blank=True)            # Track
    ground_speed = models.FloatField(null=True, blank=True)     # Ground Speed
    totalDistance = models.FloatField(null=True, blank=True)    # total Distance of the flight
    estimatedTime = models.CharField(null=True, blank=True, max_length=20)     # time Remaining on Flight
    progress = models.FloatField(null=True, blank=True)         # Flight progress 
    travaled = models.FloatField(null=True, blank=True)         # Distance Traveled in Km
    remaining = models.FloatField(null=True, blank=True)        # Distance Remaining in Km
    airportOrigin = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True, related_name="origin") # Origin airport
    airportDestination = models.ForeignKey(Airport, on_delete=models.SET_NULL, null=True, related_name="destination") # Destination airport
    
    class Meta:
        unique_together = ['hex', 'timestamp']  # Each record must be unique per flight and timestamp
    
    def __str__(self):
        return f"{self.flight} - {self.timestamp}"

# Landmark model to store landmarks' information
class Landmark(models.Model):
    name = models.CharField(max_length=30) # Name of the landmark
    location = models.CharField(max_length=20) # Location name
    lat = models.FloatField() # Latitude
    lng = models.FloatField() # Longitude
    image = models.ImageField() # Image of the landmark

    def __str__(self):
        return f"{self.name} - {self.location} - ({self.lat}, {self.lng})"

# FlightRecord model to store historical records of flights
class FlightRecord(models.Model):
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE) # Associated flight
    timestamp = models.DateTimeField()  # Timestamp of the record
    lat = models.FloatField()  # Latitude
    lng = models.FloatField()  # Longitude
    alt_baro = models.IntegerField(null=True, blank=True)  # Barometric Altitude
    alt_geom = models.IntegerField(null=True, blank=True)  # Geometric Altitude
    track = models.FloatField(null=True, blank=True)  # Track
    ground_speed = models.FloatField(null=True, blank=True)  # Ground Speed
    ground_speed = models.FloatField(null=True, blank=True)  # Ground Speed

    class Meta:
        unique_together = ['flight', 'timestamp']  # Each record must be unique per flight and timestamp
    
    def __str__(self):
        return f"{self.flight.flight} - {self.timestamp}"

# Marker model to store marker information for mapping purposes
class Marker(models.Model):
    id = models.IntegerField(primary_key=True) # Unique ID for the marker
    type = models.CharField(max_length=20) # Type of the marker (e.g., aircraft, airport)
    # Foreign keys to associate marker with a flight, airport, or landmark
    flight = models.ForeignKey(Flight, on_delete=models.SET_NULL, blank=True, null=True)
    airport = models.ForeignKey(Airport, on_delete=models.SET_NULL, blank=True, null=True)
    landmark = models.ForeignKey(Landmark, on_delete=models.SET_NULL, blank=True, null=True)
    lat = models.FloatField() # Latitude
    lng = models.FloatField() # Longitude
    flyTo = models.BooleanField(default=False) # Indicates if this marker is a fly-to destination

    def __str__(self):
        return f"{self.id}, type: {self.type}, lat: {self.lat}, lng: {self.lng}"
    
class Polyline(models.Model):
    aircraftID = models.CharField(max_length=12, null=True) # ID of the aircraft associated with the polyline
    airportIDTo = models.IntegerField(null=True) # ID of the destination airport
    airportIDFrom = models.IntegerField(null=True) # ID of the origin airport

    def __str__(self):
        return f"{self.id}"