from celery import shared_task
from .models import ActivityLog

@shared_task
def log_activity(user_id, service_id, action, counter_id=None, details=None):
    """
    Logs an activity.
    """
    ActivityLog.objects.create(
        user_id=user_id,
        service_id=service_id,
        counter_id=counter_id,
        action=action,
        details=details or {}
    )
