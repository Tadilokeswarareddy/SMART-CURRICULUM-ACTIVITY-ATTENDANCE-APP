from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'title', 'message',
            'sent_by', 'sent_by_name',
            'sender_type', 'target_section',
            'section_name', 'created_at'
        ]
        read_only_fields = ['sent_by', 'sender_type', 'created_at']

    def get_sent_by_name(self, obj):
        return obj.sent_by.get_full_name() or obj.sent_by.username

    def get_section_name(self, obj):
        return str(obj.target_section) if obj.target_section else "All"