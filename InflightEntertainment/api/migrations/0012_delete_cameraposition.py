# Generated by Django 4.2.5 on 2023-10-11 00:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_alter_airport_id_alter_marker_airport_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CameraPosition',
        ),
    ]
