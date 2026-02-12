from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Service, Counter
from .serializers import ServiceSerializer, CounterSerializer

# ViewSets for regular authenticated users (e.g., students)
class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a read-only list of active services for all authenticated users.
    """
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer

class CounterViewSet(viewsets.ModelViewSet):
    """
    Provides a list of all counters.
    """
    queryset = Counter.objects.all()
    serializer_class = CounterSerializer


# ViewSets for Admin users
class AdminServiceViewSet(viewsets.ModelViewSet):
    """
    Allows admins to perform CRUD operations on all services.
    """
    permission_classes = [IsAdminUser]
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class AdminCounterViewSet(viewsets.ModelViewSet):
    """
    Allows admins to perform CRUD operations on all counters.
    """
    permission_classes = [IsAdminUser]
    queryset = Counter.objects.all()
    serializer_class = CounterSerializer
