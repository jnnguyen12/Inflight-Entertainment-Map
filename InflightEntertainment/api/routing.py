from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/socket-server', consumers.BackendConsumer.as_asgi()),
    re_path(r'ws/socket-server/front', consumers.FrontendConsumer.as_asgi())
]