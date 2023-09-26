# Generated by Django 4.2.5 on 2023-09-26 03:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Flight",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("hex", models.CharField(max_length=10, unique=True)),
                ("flight", models.CharField(max_length=20)),
                ("r", models.CharField(max_length=10)),
                ("t", models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name="FlightRecord",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("timestamp", models.DateTimeField()),
                ("lat", models.FloatField()),
                ("lon", models.FloatField()),
                ("alt_baro", models.IntegerField()),
                ("alt_geom", models.IntegerField(blank=True, null=True)),
                ("track", models.FloatField()),
                ("gs", models.FloatField()),
                (
                    "flight",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="api.flight"
                    ),
                ),
            ],
            options={
                "unique_together": {("flight", "timestamp")},
            },
        ),
    ]
