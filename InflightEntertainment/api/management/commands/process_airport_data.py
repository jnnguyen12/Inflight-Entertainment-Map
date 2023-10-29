from django.core.management.base import BaseCommand
import json
import csv
import os
from datetime import datetime
from api.models import Airport
from django.utils import timezone

class Command(BaseCommand):
    help = 'Process csv airport data'
    
    def handle(self, *args, **options):
        cwd = os.getcwd()
        print("Current Working Directory: ", cwd)
        
        directory_path = os.path.join(cwd, 'Flight_Data/us-airports.csv')
        
        with open(directory_path, newline='') as csvfile:
            spamreader = csv.DictReader(csvfile, delimiter=',', quotechar='|')
            for row in spamreader:
                try:
                    print(row['id'], row['name'], row['latitude_deg'], row['longitude_deg'])
                    if row['id'] != '':
                        Airport.objects.create(
                            id=row['id'],
                            ident=row['ident'],
                            name=row['name'],
                            lat=row['latitude_deg'],
                            lng=row['longitude_deg']
                        )
                except:
                    print("Error: couldn't parse row ", row['id'])

            