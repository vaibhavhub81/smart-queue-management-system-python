from django.urls import path
from .views import UserCreateView, TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
