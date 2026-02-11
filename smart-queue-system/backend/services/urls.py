from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, CounterViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'counters', CounterViewSet, basename='counter')

urlpatterns = [
    path('', include(router.urls)),
]
