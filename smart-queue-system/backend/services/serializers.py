from rest_framework import serializers
from .models import Service, Counter

class CounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Counter
        fields = ('id', 'name', 'is_active')

class ServiceSerializer(serializers.ModelSerializer):
    counters = CounterSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'is_active', 'counters')
