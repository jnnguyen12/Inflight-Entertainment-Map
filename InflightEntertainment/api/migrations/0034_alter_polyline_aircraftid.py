# Generated by Django 4.2.5 on 2023-12-05 23:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_alter_airport_airporttype_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='polyline',
            name='aircraftID',
            field=models.CharField(max_length=12, null=True),
        ),
    ]
