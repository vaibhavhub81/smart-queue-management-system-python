from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QueueViewSet,
    JoinQueueView,
    MyQueuesView,
    ServiceQueueStatusView,
)

router = DefaultRouter()
router.register(r'manage', QueueViewSet, basename='queue-management')

urlpatterns = [
    path('', include(router.urls)),
    path('join/', JoinQueueView.as_view(), name='join-queue'),
    path('my-queues/', MyQueuesView.as_view(), name='my-queues'),
    path('status/<int:service_id>/', ServiceQueueStatusView.as_view(), name='service-queue-status'),
]
