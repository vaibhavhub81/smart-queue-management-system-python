from django.urls import path
from .views import ServiceAnalyticsView

urlpatterns = [
    path('services/', ServiceAnalyticsView.as_view(), name='service-analytics'),
]
