from django.shortcuts import render
from rest_framework import generics
from .models import TeacherModel
from .serializers import TeacherModelSerializer
# Create your views here.

class TeacherModelview(generics.ListCreateAPIView):
    queryset = TeacherModel.objects.all()
    serializer_class = TeacherModelSerializer

class TeacherDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherModel
    serializer_class = TeacherModelSerializer