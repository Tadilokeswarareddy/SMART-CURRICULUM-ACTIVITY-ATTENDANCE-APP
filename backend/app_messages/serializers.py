from .models import MessageModel,TeacherMessageModel
from rest_framework import serializers

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageModel
        fields = '__all__'

class TeacherMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherMessageModel
        fields = '__all__'