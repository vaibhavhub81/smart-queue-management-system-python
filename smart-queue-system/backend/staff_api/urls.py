from django.urls import path
from .views import MyServicesView

urlpatterns = [
    path('my-services/', MyServicesView.as_view(), name='my-services'),
]
