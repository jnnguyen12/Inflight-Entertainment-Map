# Generated by Django 4.2.5 on 2023-09-26 04:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_alter_flightrecord_alt_baro"),
    ]

    operations = [
        migrations.AlterField(
            model_name="flightrecord",
            name="gs",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="flightrecord",
            name="track",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
