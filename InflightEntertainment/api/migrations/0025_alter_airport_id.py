# Generated by Django 4.2.5 on 2023-11-13 22:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_rename_t_flight_aircrafttype_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='airport',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
