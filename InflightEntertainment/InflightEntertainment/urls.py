"""
URL configuration for InflightEntertainment project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from pathlib import Path
from django.views.generic import TemplateView

import os

BASE_DIR = Path(__file__).resolve().parent.parent
# List of URL patterns for the application
urlpatterns = [
    # URL pattern for the Django admin interface
    path("admin/", admin.site.urls),
    # URL pattern for the 'api' app, directing any URL starting with 'api/' to the 'api.urls' module
    path('api/',  include('api.urls')),
    # Catch-all URL pattern for serving the frontend
    # This pattern uses a regular expression to match any URL not caught by the above patterns
    # It serves the index.html file from the frontend's build directory
    re_path(r'^(?:.*)/?$', serve, {
        'document_root': os.path.join(BASE_DIR, 'frontend/build'),
        'path': 'index.html',
    }),
]
