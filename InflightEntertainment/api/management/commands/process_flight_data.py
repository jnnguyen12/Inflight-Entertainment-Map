from django.core.management.base import BaseCommand
import json
import gzip
import os
from datetime import datetime
from api.models import Flight, FlightRecord
from django.utils import timezone
import math
import re


class Command(BaseCommand):
    def __init__(self, *args, **kwargs):
        super(Command, self).__init__(*args, **kwargs)
        self.flightCode = "c07c7b"
        self.foundFlight = False
        self.lastRec = None
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
            if file_name.endswith('00Z.json.gz', 4): # this will only consider 1-minute intervals
                file_path = os.path.join(directory_path, file_name)
                self.parse_and_save(file_path)
                self.stdout.write(self.style.SUCCESS(f'Done with: {file_path}'))

    def createRecord(self, flight, timestamp, curLat, curLng, aircraft):
        alt_baro = aircraft.get('alt_baro')
        alt_geom = aircraft.get('alt_geom')
        track = aircraft.get('track')
        ground_speed = aircraft.get('gs')

        # Sometimes fields come with extra parantheses and commas
        if isinstance(alt_baro, str):
            alt_baro = re.search("\(*(\d+.*\d+),*\)*", alt_baro)
        if isinstance(alt_geom, str):
            alt_geom = re.search("\(*(\d+.*\d+),*\)*", alt_geom)
        if isinstance(track, str):
            track = re.search("\(*(\d+.*\d+),*\)*", track)
        if isinstance(ground_speed, str):
            ground_speed = re.search("\(*(\d+.*\d+),*\)*", ground_speed)

        rec = FlightRecord.objects.create(
            flight=flight,
            timestamp=timestamp,
            lat=curLat,
            lng=curLng,
            alt_baro=alt_baro,
            alt_geom=alt_geom,
            track=track,
            ground_speed=ground_speed
        )

        self.lastRec = rec

        print(f"Created FlightRecord: {flight}, {timestamp}, {rec.lat}, {rec.lng}")
        return rec

    def parse_and_save(self, file_path):
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            data = json.load(f)
        
        timestamp = timezone.make_aware(datetime.utcfromtimestamp(data['now']))
        flight, _ = Flight.objects.get_or_create(hex=self.flightCode)
        
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
        if self.foundFlight is False:
            self.interpolate(flight, timestamp)

        self.foundFlight = False

    # Didn't find flight in record - estimate position
    def interpolate(self, flight, timestamp):
        if(self.foundFlight is False and (not self.lastRec is None)):
            print("Estimating position")
            x_diff = self.lastRec.ground_speed * math.cos(self.lastRec.track) / 60
            y_diff = self.lastRec.ground_speed * math.sin(self.lastRec.track) / 60
            curLat = self.lastRec.lat + y_diff
            curLng = self.lastRec.lng + x_diff
            extras = {
                'flight': self.lastRec.flight,
                'alt_baro': self.lastRec.alt_baro, 
                'alt_geom': self.lastRec.alt_geom,
                'track': self.lastRec.track,
                'gs':  self.lastRec.ground_speed
            }
            self.createRecord(flight, timestamp, curLat, curLng, extras)

        self.foundFlight = False