from rest_framework import viewsets
from .models import Service, Counter
from .serializers import ServiceSerializer, CounterSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer

class CounterViewSet(viewsets.ModelViewSet):
    queryset = Counter.objects.all()
    serializer_class = CounterSerializer
