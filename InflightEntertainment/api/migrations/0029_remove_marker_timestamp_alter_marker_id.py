# Generated by Django 4.2.5 on 2023-12-05 19:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_flight_estimatedtime_flight_progress_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='marker',
            name='timestamp',
        ),
        migrations.AlterField(
            model_name='marker',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
