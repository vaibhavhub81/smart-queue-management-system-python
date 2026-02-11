from django.db import models
from django.conf import settings
from services.models import Service, Counter

class QueueEntry(models.Model):
    STATUS_CHOICES = (
        ('waiting', 'Waiting'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    counter = models.ForeignKey(Counter, on_delete=models.SET_NULL, null=True, blank=True)
    token_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.service.name} - Token {self.token_number} ({self.user.username})"
