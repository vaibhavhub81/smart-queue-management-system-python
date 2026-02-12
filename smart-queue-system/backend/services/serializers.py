from rest_framework import serializers
from .models import Service, Counter
from users.models import User

class CounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Counter
        fields = ('id', 'name', 'is_active')

class ServiceSerializer(serializers.ModelSerializer):
    counters = CounterSerializer(many=True, read_only=True)
    staff = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role__in=['staff', 'admin']),
        required=False
    )

    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'is_active', 'counters', 'staff')
