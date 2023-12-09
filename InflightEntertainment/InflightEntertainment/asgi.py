"""
ASGI config for InflightEntertainment project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import api.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "InflightEntertainment.settings")

# Creating an ASGI application instance
# ProtocolTypeRouter is used to route different types of communication protocols
application = ProtocolTypeRouter({
    # Configuring the application to serve HTTP requests
    "http": get_asgi_application(),
    # Configuring WebSocket protocol with authentication middleware
    "websocket": AuthMiddlewareStack(
        # URLRouter is used to route incoming WebSocket connections based on URL patterns
        URLRouter(
            api.routing.websocket_urlpatterns # Using the URL patterns defined in 'api.routing'
        )
    )
})
