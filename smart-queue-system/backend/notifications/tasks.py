from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@shared_task
def send_notification_to_user(user_id, message):
    """
    Sends a notification to a specific user.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "message": message,
        },
    )

@shared_task
def broadcast_public_update(message):
    """
    Broadcasts a message to all connected clients on the public channel.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "public_service_updates",
        {
            "type": "send_notification",
            "message": message,
        },
    )
