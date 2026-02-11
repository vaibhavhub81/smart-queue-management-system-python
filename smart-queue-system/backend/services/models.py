from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Counter(models.Model):
    name = models.CharField(max_length=100)
    service = models.ForeignKey(Service, related_name='counters', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.service.name})"
