from django.apps import AppConfig


# Defining a configuration class for the 'API' app
class ApiConfig(AppConfig):
    # Setting the default field type for primary keys in models
    default_auto_field = "django.db.models.BigAutoField"
    # Name of the app; used in various places within Django, like in settings
    name = "api"