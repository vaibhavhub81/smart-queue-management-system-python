from django.db.models import Avg, Count, F, ExpressionWrapper, fields
from django.utils import timezone
from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from .models import ActivityLog, Service
from .serializers import ServiceAnalyticsSerializer
from core.permissions import IsAdminUser

class ServiceAnalyticsView(views.APIView):
    """
    Provides analytics for all services.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        
        # Calculate analytics for each service
        services = Service.objects.all()
        analytics_data = []

        for service in services:
            # Count of different actions
            completed_users = ActivityLog.objects.filter(service=service, action='service_completed', timestamp__date=today).count()
            skipped_users = ActivityLog.objects.filter(service=service, action='user_skipped', timestamp__date=today).count()
            total_users = ActivityLog.objects.filter(service=service, action='user_join', timestamp__date=today).count()

            # Calculate average wait time
            logs_today = ActivityLog.objects.filter(service=service, timestamp__date=today)
            avg_wait_time = self.calculate_average_wait_time(logs_today)

            analytics_data.append({
                'service_id': service.id,
                'service_name': service.name,
                'total_users': total_users,
                'completed_users': completed_users,
                'skipped_users': skipped_users,
                'average_wait_time': avg_wait_time,
            })
            
        serializer = ServiceAnalyticsSerializer(analytics_data, many=True)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    def calculate_average_wait_time(self, logs):
        total_wait_time = timezone.timedelta(0)
        valid_waits = 0

        # Filter for 'called' or 'completed' actions
        processed_logs = logs.filter(action__in=['user_called', 'service_completed'])

        for log in processed_logs:
            # Find the corresponding 'join' action for the same user and service
            join_log = ActivityLog.objects.filter(
                user=log.user,
                service=log.service,
                action='user_join',
                timestamp__lt=log.timestamp
            ).order_by('-timestamp').first()

            if join_log:
                wait_time = log.timestamp - join_log.timestamp
                total_wait_time += wait_time
                valid_waits += 1

        return total_wait_time / valid_waits if valid_waits > 0 else timezone.timedelta(0)
