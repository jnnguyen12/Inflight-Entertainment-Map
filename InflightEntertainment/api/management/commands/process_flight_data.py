from django.core.management.base import BaseCommand
import json
import gzip
import os
from datetime import datetime
from api.models import Flight, FlightRecord
from django.utils import timezone

class Command(BaseCommand):
    help = 'Process .json.gz flight data files'
    
    def handle(self, *args, **options):
            # Print the current working directory for debugging
        cwd = os.getcwd()
        print("Current Working Directory: ", cwd)
        
        # Adjust the relative path based on the current working directory
        directory_path = os.path.join(cwd, 'Flight_Data')
        if not os.path.exists(directory_path):
            self.stdout.write(self.style.ERROR(f'Directory not found: {directory_path}'))
            return
        
        files = os.listdir(directory_path)
        for file_name in sorted(files):
            if file_name.endswith('.json.gz'):
                file_path = os.path.join(directory_path, file_name)
                self.parse_and_save(file_path)
                self.stdout.write(self.style.SUCCESS(f'Done with: {file_path}'))

    def parse_and_save(self, file_path):
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            data = json.load(f)
        
        timestamp = timezone.make_aware(datetime.utcfromtimestamp(data['now']))
        
        for aircraft in data.get('aircraft', []):
            hex_code = aircraft.get('hex')
            if hex_code == "a73d45":
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
                if FlightRecord.objects.filter(flight=flight, timestamp=timestamp).exists():
                    continue  # Skip this record if it already exists
                FlightRecord.objects.create(
                    flight=flight,
                    timestamp=timestamp,
                    lat=aircraft.get('lat'),
                    lon=aircraft.get('lon'),
                    alt_baro=alt_baro,
                    alt_geom=aircraft.get('alt_geom'),
                    track=aircraft.get('track'),
                    gs=aircraft.get('gs')
                )