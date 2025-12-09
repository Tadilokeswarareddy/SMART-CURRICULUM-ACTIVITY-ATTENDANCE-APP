from django.shortcuts import render
from rest_framework import generics
from .models import UserModel,StudentModel,TeacherModel
from .serializers import UserModelSerializers,StudentModelSerializer,TeacherModelSerializer
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

class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel
    serializer_class = StudentModelSerializer

class StudentDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentModel
    serializer_class = StudentModelSerializer

class TeacherModelview(generics.ListCreateAPIView):
    queryset = TeacherModel
    serializer_class = TeacherModelSerializer

class TeacherDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherModel
    serializer_class = TeacherModelSerializer