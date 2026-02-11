import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()

        # Join room group for the user
        self.room_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Join room group for public service updates
        self.public_group_name = "public_service_updates"
        await self.channel_layer.group_add(
            self.public_group_name,
            self.channel_name
        )
        
        await self.accept()
        await self.send(text_data=json.dumps({
            'message': 'Connection established'
        }))

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                self.public_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # We don't need to receive messages from the client for this app
        pass

    async def send_notification(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
