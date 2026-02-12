import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from services.models import Service

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        # Join room group for the user
        self.room_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # Join room group for public service updates
        self.public_group_name = "public_service_updates"
        await self.channel_layer.group_add(self.public_group_name, self.channel_name)

        # For staff/admin, join groups for the services they manage
        self.staff_service_groups = []
        if self.user.role in ['staff', 'admin']:
            services = await self.get_user_services()
            for service in services:
                group_name = f"service_{service.id}_staff"
                self.staff_service_groups.append(group_name)
                await self.channel_layer.group_add(group_name, self.channel_name)
        
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connection established successfully.'
        }))

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.channel_layer.group_discard(self.public_group_name, self.channel_name)
            # Discard staff service groups
            for group_name in self.staff_service_groups:
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        # We don't need to receive messages from the client for this app
        pass

    async def send_notification(self, event):
        """ Handler for personal user notifications. """
        await self.send(text_data=json.dumps(event['message']))

    async def send_staff_notification(self, event):
        """ Handler for staff-specific notifications. """
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def get_user_services(self):
        if self.user.role == 'admin':
            return list(Service.objects.all())
        return list(self.user.services.all())
