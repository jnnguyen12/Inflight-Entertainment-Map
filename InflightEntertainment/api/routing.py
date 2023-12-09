from django.urls import re_path
from . import consumers

# List of URL patterns for WebSocket connections
websocket_urlpatterns = [
    # The re_path function is used to define a routing pattern.
    # This pattern matches any URL that follows the specified regex pattern.
    # r'ws/socket-server' is a regular expression that matches the URL 'ws/socket-server'.
    # consumers.BackendConsumer.as_asgi() is the ASGI application that is called for incoming WebSocket connections.
    # as_asgi() method is used to create an ASGI application instance of BackendConsumer.
    re_path(r'ws/socket-server', consumers.BackendConsumer.as_asgi()),
]