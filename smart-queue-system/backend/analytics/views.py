from django.db.models import Avg, Count, F, ExpressionWrapper, fields
from django.utils import timezone
from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from .models import ActivityLog, Service
from .serializers import ServiceAnalyticsSerializer
from core.permissions import IsAdminUser
from collections import defaultdict

class ServiceAnalyticsView(views.APIView):
    """
    Provides analytics for all services.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        
        services = Service.objects.all()
        analytics_data = []

        # Get all logs for today to process in memory
        logs_today = ActivityLog.objects.filter(timestamp__date=today).order_by('timestamp')

        # Group logs by service
        logs_by_service = defaultdict(list)
        for log in logs_today:
            logs_by_service[log.service_id].append(log)

        for service in services:
            service_logs = logs_by_service.get(service.id, [])
            
            total_users = sum(1 for log in service_logs if log.action == 'user_join')
            completed_users = sum(1 for log in service_logs if log.action == 'service_completed')
            skipped_users = sum(1 for log in service_logs if log.action == 'user_skipped')

            avg_wait_time = self.calculate_average_wait_time(service_logs)

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
        user_join_times = {}
        completed_count = 0

        for log in logs:
            if log.action == 'user_join':
                # Store the last join time for a user (in case they join multiple times)
                user_join_times[log.user_id] = log.timestamp
            elif log.action in ['service_completed', 'user_skipped', 'user_called']:
                if log.user_id in user_join_times:
                    wait_time = log.timestamp - user_join_times[log.user_id]
                    # Basic check to avoid negative wait times if data is weird
                    if wait_time > timezone.timedelta(0):
                        total_wait_time += wait_time
                        completed_count += 1
                        # A user's wait time is only counted once.
                        del user_join_times[log.user_id] 

        return total_wait_time / completed_count if completed_count > 0 else timezone.timedelta(0)
