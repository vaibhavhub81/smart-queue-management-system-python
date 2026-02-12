from django.urls import path
from .views import UserCreateView, MyTokenObtainPairView, TokenRefreshView, UserProfileView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
]
