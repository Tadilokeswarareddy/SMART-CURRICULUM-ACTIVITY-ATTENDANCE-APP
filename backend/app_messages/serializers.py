from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sent_by_name    = serializers.SerializerMethodField()
    section_names   = serializers.SerializerMethodField()
    student_names   = serializers.SerializerMethodField()
    target_sections = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    target_students = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model  = Message
        fields = [
            'id', 'title', 'message',
            'sent_by', 'sent_by_name', 'sender_type',
            'target_sections', 'section_names',
            'target_students', 'student_names',
            'created_at',
        ]
        read_only_fields = ['sent_by', 'sender_type', 'created_at']

    def get_sent_by_name(self, obj):
        return obj.sent_by.get_full_name() or obj.sent_by.username

    def get_section_names(self, obj):
        return [
            f"{s.branch.name} {s.name}" for s in obj.target_sections.all()
        ]

    def get_student_names(self, obj):
        return [
            s.user.get_full_name() or s.user.username
            for s in obj.target_students.all()
        ]