from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import QueueEntry, Service
from .serializers import QueueEntrySerializer, CreateQueueEntrySerializer
from core.permissions import IsStaffOrAdmin, IsAdminUser

class QueueViewSet(viewsets.ViewSet):
    """
    ViewSet for queue management.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QueueEntry.objects.all()

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def call_next(self, request, pk=None):
        """
        Calls the next user in the queue for a specific service.
        """
        service = get_object_or_404(Service, pk=pk)
        user = request.user

        # Check if the user is authorized to manage this service
        if user.role != 'admin' and user not in service.staff.all():
            return Response({'detail': 'You are not authorized to manage this service.'}, status=status.HTTP_403_FORBIDDEN)

        counter = request.data.get('counter_id')
        
        with transaction.atomic():
            # Find the next waiting user
            next_user_entry = QueueEntry.objects.select_for_update().filter(
                service=service, 
                status='waiting'
            ).order_by('created_at').first()

            if not next_user_entry:
                return Response({'detail': 'No users in the queue.'}, status=status.HTTP_404_NOT_FOUND)

            # Update the status to 'in_progress'
            next_user_entry.status = 'in_progress'
            if counter:
                next_user_entry.counter_id = counter
            next_user_entry.save()
            
            # Send notification via WebSocket to the user and to the public dashboard
            from notifications.tasks import send_notification_to_user, broadcast_public_update
            
            # Notify the user
            user_message = {
                'type': 'queue_update',
                'status': 'in_progress',
                'service': service.name,
                'token': next_user_entry.token_number,
                'message': f"It's your turn for {service.name}. Please proceed to counter {next_user_entry.counter.name if next_user_entry.counter else ''}."
            }
            send_notification_to_user.delay(next_user_entry.user.id, user_message)
            
            # Broadcast to public dashboard
            public_message = {
                'type': 'public_update',
                'service_id': service.id,
                'now_serving': next_user_entry.token_number
            }
            broadcast_public_update.delay(public_message)

            # Notify staff of the update
            from notifications.tasks import notify_staff_of_queue_update
            queue_entries = QueueEntry.objects.filter(service=service, status__in=['waiting', 'in_progress']).order_by('created_at')
            queue_serializer = QueueEntrySerializer(queue_entries, many=True)
            staff_message = {
                'type': 'queue_update',
                'service_id': service.id,
                'queue': queue_serializer.data
            }
            notify_staff_of_queue_update.delay(service.id, staff_message)

            from analytics.tasks import log_activity
            log_activity.delay(
                next_user_entry.user.id, 
                service.id, 
                'user_called', 
                counter_id=next_user_entry.counter_id, 
                details={'token': next_user_entry.token_number}
            )

            serializer = QueueEntrySerializer(next_user_entry)
            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def complete_service(self, request, pk=None):
        """
        Marks a queue entry as completed.
        """
        entry = get_object_or_404(QueueEntry, pk=pk)
        user = request.user
        service = entry.service

        # Check if the user is authorized to manage this service
        if user.role != 'admin' and user not in service.staff.all():
            return Response({'detail': 'You are not authorized to manage this service.'}, status=status.HTTP_403_FORBIDDEN)

        entry.status = 'completed'
        entry.save()
        
        # Notify staff of the update
        from notifications.tasks import notify_staff_of_queue_update
        queue_entries = QueueEntry.objects.filter(service=service, status__in=['waiting', 'in_progress']).order_by('created_at')
        queue_serializer = QueueEntrySerializer(queue_entries, many=True)
        staff_message = {
            'type': 'queue_update',
            'service_id': service.id,
            'queue': queue_serializer.data
        }
        notify_staff_of_queue_update.delay(service.id, staff_message)

        from notifications.tasks import send_notification_to_user
        message = {
            'type': 'queue_update',
            'status': 'completed',
            'service': entry.service.name,
            'message': f"Your service for {entry.service.name} is complete. Thank you!"
        }
        send_notification_to_user.delay(entry.user.id, message)
        
        from analytics.tasks import log_activity
        log_activity.delay(
            entry.user.id,
            entry.service.id,
            'service_completed',
            counter_id=entry.counter_id,
            details={'token': entry.token_number}
        )
        
        return Response({'detail': 'Service completed.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def skip_user(self, request, pk=None):
        """
        Skips a user in the queue.
        """
        entry = get_object_or_404(QueueEntry, pk=pk)
        user = request.user
        service = entry.service

        # Check if the user is authorized to manage this service
        if user.role != 'admin' and user not in service.staff.all():
            return Response({'detail': 'You are not authorized to manage this service.'}, status=status.HTTP_403_FORBIDDEN)

        entry.status = 'skipped'
        entry.save()

        # Notify staff of the update
        from notifications.tasks import notify_staff_of_queue_update
        queue_entries = QueueEntry.objects.filter(service=service, status__in=['waiting', 'in_progress']).order_by('created_at')
        queue_serializer = QueueEntrySerializer(queue_entries, many=True)
        staff_message = {
            'type': 'queue_update',
            'service_id': service.id,
            'queue': queue_serializer.data
        }
        notify_staff_of_queue_update.delay(service.id, staff_message)
        
        from notifications.tasks import send_notification_to_user
        message = {
            'type': 'queue_update',
            'status': 'skipped',
            'service': entry.service.name,
            'message': f"You have been skipped in the queue for {entry.service.name}. Please contact staff for assistance."
        }
        send_notification_to_user.delay(entry.user.id, message)
        
        from analytics.tasks import log_activity
        log_activity.delay(
            entry.user.id,
            entry.service.id,
            'user_skipped',
            counter_id=entry.counter_id,
            details={'token': entry.token_number}
        )
        
        return Response({'detail': 'User skipped.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def reject_user(self, request, pk=None):
        """
        Rejects a user from the queue.
        """
        entry = get_object_or_404(QueueEntry, pk=pk)
        user = request.user
        service = entry.service

        # Check if the user is authorized to manage this service
        if user.role != 'admin' and user not in service.staff.all():
            return Response({'detail': 'You are not authorized to manage this service.'}, status=status.HTTP_403_FORBIDDEN)

        entry.status = 'rejected'
        entry.save()

        # Notify staff of the update
        from notifications.tasks import notify_staff_of_queue_update
        queue_entries = QueueEntry.objects.filter(service=service, status__in=['waiting', 'in_progress']).order_by('created_at')
        queue_serializer = QueueEntrySerializer(queue_entries, many=True)
        staff_message = {
            'type': 'queue_update',
            'service_id': service.id,
            'queue': queue_serializer.data
        }
        notify_staff_of_queue_update.delay(service.id, staff_message)
        
        from notifications.tasks import send_notification_to_user
        message = {
            'type': 'queue_update',
            'status': 'rejected',
            'service': entry.service.name,
            'message': f"Your request for {entry.service.name} has been rejected. Please contact staff for more information."
        }
        send_notification_to_user.delay(entry.user.id, message)
        
        from analytics.tasks import log_activity
        log_activity.delay(
            entry.user.id,
            entry.service.id,
            'user_rejected',
            counter_id=entry.counter_id,
            details={'token': entry.token_number}
        )
        
        return Response({'detail': 'User rejected.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def send_custom_notification(self, request, pk=None):
        """
        Sends a custom notification message to a specific user in the queue.
        """
        entry = get_object_or_404(QueueEntry, pk=pk)
        user = request.user
        service = entry.service

        # Check if the user is authorized to manage this service
        if user.role != 'admin' and user not in service.staff.all():
            return Response({'detail': 'You are not authorized to manage this service.'}, status=status.HTTP_403_FORBIDDEN)

        custom_message_text = request.data.get('message')
        if not custom_message_text:
            return Response({'detail': 'Message text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from notifications.tasks import send_notification_to_user
        message = {
            'type': 'custom_notification',
            'service': entry.service.name,
            'message': custom_message_text
        }
        send_notification_to_user.delay(entry.user.id, message)
        
        from analytics.tasks import log_activity
        log_activity.delay(
            entry.user.id,
            entry.service.id,
            'custom_notification_sent',
            counter_id=entry.counter_id,
            details={'token': entry.token_number, 'message': custom_message_text}
        )

        return Response({'detail': 'Custom notification sent.'}, status=status.HTTP_200_OK)


class JoinQueueView(generics.CreateAPIView):
    """
    Allows an authenticated user to join a queue for a specific service.
    """
    serializer_class = CreateQueueEntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        service = serializer.validated_data['service']
        user = self.request.user

        if QueueEntry.objects.filter(user=user, service=service, status__in=['waiting', 'in_progress']).exists():
            raise serializers.ValidationError("You are already in the queue for this service.")

        with transaction.atomic():
            # Get the last token number for this service
            last_token = QueueEntry.objects.filter(service=service).order_by('-token_number').first()
            new_token_number = (last_token.token_number + 1) if last_token else 1
            
            entry = serializer.save(
                user=user, 
                token_number=new_token_number
            )
            
            # Notify staff of the update
            from notifications.tasks import notify_staff_of_queue_update
            queue_entries = QueueEntry.objects.filter(service=service, status__in=['waiting', 'in_progress']).order_by('created_at')
            queue_serializer = QueueEntrySerializer(queue_entries, many=True)
            staff_message = {
                'type': 'queue_update',
                'service_id': service.id,
                'queue': queue_serializer.data
            }
            notify_staff_of_queue_update.delay(service.id, staff_message)

            from notifications.tasks import broadcast_public_update
            public_message = {
                'type': 'public_update',
                'service_id': service.id,
                'queue_length': queue_entries.count()
            }
            broadcast_public_update.delay(public_message)

            from analytics.tasks import log_activity
            log_activity.delay(user.id, service.id, 'user_join', details={'token': new_token_number})

class MyQueuesView(generics.ListAPIView):
    """
    Returns a list of all queue entries for the currently authenticated user.
    """
    serializer_class = QueueEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QueueEntry.objects.filter(user=self.request.user).order_by('-created_at')

class ServiceQueueStatusView(generics.ListAPIView):
    """
    Returns the current queue status for a given service.
    """
    serializer_class = QueueEntrySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        service_id = self.kwargs['service_id']
        return QueueEntry.objects.filter(service_id=service_id, status__in=['waiting', 'in_progress']).order_by('created_at')

