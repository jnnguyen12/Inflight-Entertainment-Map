from django.core.management.base import BaseCommand
import json
import gzip
import os
from datetime import datetime
from api.models import Flight, FlightRecord
from django.utils import timezone
import math


class Command(BaseCommand):
    def __init__(self, *args, **kwargs):
        super(Command, self).__init__(*args, **kwargs)
        self.flightCode = "c07c7b"
        self.foundFlight = False
        self.lastRec = None
        self.latSpeed = 0
        self.lngSpeed = 0
        help = 'Process .json.gz flight data files'
    
    def handle(self, *args, **options):
        cwd = os.getcwd()
        print("Current Working Directory: ", cwd)
        
        directory_path = os.path.join(cwd, 'Flight_Data')
        if not os.path.exists(directory_path):
            self.stdout.write(self.style.ERROR(f'Directory not found: {directory_path}'))
            return
        
        files = os.listdir(directory_path)
        for file_name in sorted(files):
            if file_name.endswith('00Z.json.gz', 4): # this will only consider 1-minute intervals
                file_path = os.path.join(directory_path, file_name)
                self.parse_and_save(file_path)
                self.stdout.write(self.style.SUCCESS(f'Done with: {file_path}'))

    def createRecord(self, flight, timestamp, curLat, curLng, aircraft):
        rec = FlightRecord.objects.create(
            flight=flight,
            timestamp=timestamp
        )
        # Only set lat and lng if its an interpolated record
        if aircraft:
            rec.lat = curLat
            rec.lng = curLng,
            rec.alt_baro = aircraft.get("alt_baro"),
            rec.alt_geom = aircraft.get("alt_geom"),
            rec.track = aircraft.get("track"),
            rec.ground_speed = aircraft.get("ground_speed")
        else:
            rec.lat = curLat,
            rec.lng = curLng,
            rec.alt_baro = None,
            rec.alt_geom = None,
            rec.track = None,
            rec.ground_speed = None
        rec.save()

        if not self.lastRec is None:
            rec.save(update_fields=['rotation'])
            self.latSpeed = rec.lat - self.lastRec.lat
            self.lngSpeed = rec.lng - self.lastRec.lng
        self.lastRec = rec

        print(f"Created FlightRecord: {flight}, {timestamp}, {rec.lat}, {rec.lng}")
        return rec

    def parse_and_save(self, file_path):
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            data = json.load(f)
        
        timestamp = timezone.make_aware(datetime.utcfromtimestamp(data['now']))
        flight, _ = Flight.objects.get_or_create(hex=self.flightCode)
        # alt_baro = aircraft.get('alt_baro')
        # alt_baro = None if isinstance(alt_baro, str) else alt_baro
        
        for aircraft in data.get('aircraft', []):
            hex_code = aircraft.get('hex')
            try:
                if hex_code == self.flightCode:
                    print("Found flight code")
                    flight.flight = aircraft.get('flight').strip()
                    flight.registration = aircraft.get('r')
                    flight.aircraftType = aircraft.get('t')
                    flight.save(update_fields=['flight', 'registration', 'aircraftType'])
                    self.foundFlight = True
                
                    # Skip this record if it already exists
                    rec = FlightRecord.objects.filter(flight=flight, timestamp=timestamp)
                    if rec.exists():
                        print(f"Skipping {timestamp}")
                        continue  

                    # Flight found but with no coordinates, try backup fields
                    if(aircraft.get('lat') is None):
                        print("using predicted coordinates")
                        curLat = aircraft.get('rr_lat')
                        curLng = aircraft.get('rr_lon')
                        rec = self.createRecord(flight, timestamp, curLat, curLng, aircraft)
                    else:
                        # Found flight with coordinates
                        curLat = aircraft.get('lat')
                        curLng = aircraft.get('lon')
                        rec = self.createRecord(flight, timestamp, curLat, curLng, aircraft)
            except Exception as e:
                print("Error: ", e)

        # Didn't find flight in record - estimate position
        if(self.foundFlight is False and (not self.lastRec is None)):
            print("Estimating position")
            curLat = self.lastRec.lat + self.latSpeed
            curLng = self.lastRec.lng + self.lngSpeed
            rec = self.createRecord(flight, timestamp, curLat, curLng, None)

        self.foundFlight = False
