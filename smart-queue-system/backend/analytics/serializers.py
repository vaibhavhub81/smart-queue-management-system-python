from rest_framework import serializers

class WaitTimeSerializer(serializers.Serializer):
    average_wait_time = serializers.DurationField()

class ServiceAnalyticsSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()
    service_name = serializers.CharField()
    total_users = serializers.IntegerField()
    completed_users = serializers.IntegerField()
    skipped_users = serializers.IntegerField()
    average_wait_time = serializers.DurationField()
