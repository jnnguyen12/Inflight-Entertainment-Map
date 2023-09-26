from django.core.management.base import BaseCommand
from api.models import CameraPosition




class Command(BaseCommand):
    def handle(self, *args, **options):
        lat = 41.76345,        # Cameras initial lat
        lng = -93.64245,      # Cameras initial lng
        zoom = 10            # Cameras initial zoom

        CameraPosition.objects.create(lat, lng, zoom)