from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path,include
from .views import UserRegisterView,MyTokenObtainPairView

urlpatterns = [
    
    path('token/',MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/',UserRegisterView.as_view()),
    path('',include('app_messages.urls')),
    path('',include('student.urls')),
    path('',include('teacher.urls')),
]