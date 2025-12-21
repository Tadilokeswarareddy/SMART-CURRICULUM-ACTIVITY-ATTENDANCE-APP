from django.shortcuts import render
from rest_framework import generics
from .models import MessageModel,TeacherMessageModel
from .serializers import TeacherMessageSerializer,MessageSerializer
# Create your views here.

class MessageView(generics.ListCreateAPIView):
    queryset = MessageModel.objects.all()
    serializer_class = MessageSerializer

class MessageDetailview(generics.RetrieveUpdateAPIView):
    queryset = MessageModel
    serializer_class = MessageSerializer

class TeacherMessageView(generics.ListCreateAPIView):
    queryset = TeacherMessageModel.objects.all()
    serializer_class = TeacherMessageSerializer

class TeacherMessageDetailview(generics.RetrieveUpdateAPIView):
    queryset = TeacherMessageModel
    serializer_class = TeacherMessageSerializer