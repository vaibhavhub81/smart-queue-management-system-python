from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import AdminUserViewSet
from services.views import AdminServiceViewSet, AdminCounterViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-user')
router.register(r'services', AdminServiceViewSet, basename='admin-service')
router.register(r'counters', AdminCounterViewSet, basename='admin-counter')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]
