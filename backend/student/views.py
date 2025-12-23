from django.shortcuts import render
from rest_framework import generics
from .models import StudentModel
from .serializers import StudentModelSerializer
# Create your views here.

class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentModelSerializer

class StudentDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentModel
    serializer_class = StudentModelSerializer