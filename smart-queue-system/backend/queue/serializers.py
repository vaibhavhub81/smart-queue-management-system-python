from rest_framework import serializers
from .models import QueueEntry
from users.serializers import UserSerializer
from services.serializers import ServiceSerializer, CounterSerializer

class QueueEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    counter = CounterSerializer(read_only=True)

    class Meta:
        model = QueueEntry
        fields = ('id', 'user', 'service', 'counter', 'token_number', 'status', 'created_at')

class CreateQueueEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueEntry
        fields = ('service',)
