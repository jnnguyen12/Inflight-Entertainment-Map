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

    def parse_and_save(self, file_path):
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            data = json.load(f)
        
        timestamp = timezone.make_aware(datetime.utcfromtimestamp(data['now']))
        
        for aircraft in data.get('aircraft', []):
            hex_code = aircraft.get('hex')
            if hex_code == "71ba08":
                try:
                    flight, _ = Flight.objects.get_or_create(
                        hex=hex_code,
                        defaults={
                            'flight': aircraft.get('flight').strip(),
                            'r': aircraft.get('r'),
                            't': aircraft.get('t')
                        }
                    )
                    alt_baro = aircraft.get('alt_baro')
                    alt_baro = None if isinstance(alt_baro, str) else alt_baro
                
                    # Skip this record if it already exists
                    if FlightRecord.objects.filter(flight=flight, timestamp=timestamp).exists():
                        print(f"Skipping {timestamp}")
                        self.latSpeed = rec.lat - self.lastRec.lat
                        self.lngSpeed = rec.lng - self.lastRec.lng
                        self.lastRec = rec
                        continue  

                    # Flight found but with no coordinates, try backup fields
                    if(aircraft.get('lat') is None):
                        print("using predicted coordinates")
                        rec = FlightRecord.objects.create(
                            flight=flight,
                            timestamp=timestamp,
                            lat=aircraft.get('rr_lat'),
                            lng=aircraft.get('rr_lon'),
                            alt_baro=alt_baro,
                            alt_geom=None,
                            track=None,
                            ground_speed=None
                        )
                        self.lastRec = rec if self.lastRec is None else self.lastRec
                        self.latSpeed = rec.lat - self.lastRec.lat
                        self.lngSpeed = rec.lng - self.lastRec.lng
                        self.lastRec = rec
                        print("rec: " + rec.id)

                    else:
                        # Found flight with coordinates
                        rec = FlightRecord.objects.create(
                            flight=flight,
                            timestamp=timestamp,
                            lat=aircraft.get('lat'),
                            lng=aircraft.get('lon'),
                            alt_baro=alt_baro,
                            alt_geom=aircraft.get('alt_geom'),
                            track=aircraft.get('track'),
                            ground_speed=aircraft.get('gs')
                        )
                        self.lastRec = rec if self.lastRec is None else self.lastRec
                        self.latSpeed = rec.lat - self.lastRec.lat
                        self.lngSpeed = rec.lng - self.lastRec.lng
                        self.lastRec = rec
                        print("rec: " + rec.id)
                    print(f"FlightRecord: {flight}, {timestamp}, {aircraft.get('lat')}, {aircraft.get('lon')}")
                except Exception as e:
                    print("Error: ", e)
            else:
                # Didn't find flight in record - estimate position
                if(not self.lastRec is None):
                    print("Estimating position")
                    print("lastRec")
                    curLat = self.lastRec.lat + self.latSpeed
                    curLng = self.lastRec.lng + self.lngSpeed
                    rec = FlightRecord.objects.create(
                            flight = self.lastRec.flight,
                            timestamp = timestamp,
                            lat = curLat,
                            lng = curLng,
                            alt_baro = alt_baro,
                            alt_geom = self.lastRec.alt_geom,
                            track = self.lastRec.track,
                            ground_speed = self.lastRec.ground_speed
                        )
                    self.lastRec = rec if self.lastRec is None else self.lastRec
                    self.latSpeed = rec.lat - self.lastRec.lat
                    self.lngSpeed = rec.lng - self.lastRec.lng
                    self.lastRec = rec


                    
    # function calculateRotation(lat1: number, lng1: number, lat2: number, lng2: number): number {
    # const toRadians = (degree: number) => degree * (Math.PI / 180);
    # const toDegrees = (radians: number) => radians * (180 / Math.PI);
    # const radLat1 = toRadians(lat1);
    # const radLat2 = toRadians(lat2);
    # const diffLng = toRadians(lng2 - lng1);
    # return (toDegrees(Math.atan2(
    #     Math.sin(diffLng) * Math.cos(radLat2),
    #     Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
    # )) + 360) % 360;

    def calculateRotation(lat1, lng1, lat2, lng2):
        radLat1 = lat1 * (math.pi / 180)
        radLat2 = lat2 * (math.pi / 180)
        lngDiff = (lng2 - lng1) * (math.pi / 180)
        radRotation = math.atan2(math.sin(lngDiff) * math.cos(radLat2),
                                math.cos(radLat1) * math.sin(radLat2) - math.sin(radLat1) * math.cos(radLat2) * math.cos(lngDiff))
        degRotation = ((radRotation * 180 / math.pi) + 360) % 360
        return degRotation