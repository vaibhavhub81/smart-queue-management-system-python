from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from services.models import Service
from services.serializers import ServiceSerializer
from core.permissions import IsStaffOrAdmin

class MyServicesView(generics.ListAPIView):
    """
    Returns a list of all services assigned to the currently authenticated staff user.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Service.objects.all()
        return user.services.all()
