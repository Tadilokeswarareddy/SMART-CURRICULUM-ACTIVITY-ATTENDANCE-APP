from django.shortcuts import render
from rest_framework import generics
from .models import UserModel
from .serializers import UserModelSerializers
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
# Create your views here.

class UserRegisterView(generics.CreateAPIView):
    queryset = UserModel
    serializer_class = UserModelSerializers
    permission_classes = [AllowAny]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer