from django.db import models
from django.conf import settings
from services.models import Service, Counter

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('user_join', 'User Join'),
        ('user_called', 'User Called'),
        ('service_completed', 'Service Completed'),
        ('user_skipped', 'User Skipped'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    counter = models.ForeignKey(Counter, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.action} on {self.service.name} at {self.timestamp}"
