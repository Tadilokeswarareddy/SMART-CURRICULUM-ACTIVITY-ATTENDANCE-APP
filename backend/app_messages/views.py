from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer
from django.db import models



class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role not in ['admin', 'teacher']:
            return Response({"error": "Only admin or teacher can send messages"}, status=403)

        title = request.data.get('title')
        message = request.data.get('message')
        target_section_id = request.data.get('target_section')  # optional for admin, required for teacher

        if not title or not message:
            return Response({"error": "title and message are required"}, status=400)

        if user.role == 'teacher' and not target_section_id:
            return Response({"error": "Teachers must specify a target_section"}, status=400)

        # Teachers can only message sections they actually teach
        if user.role == 'teacher':
            from api.models import TeachingAssignment
            teaches_section = TeachingAssignment.objects.filter(
                teacher=user.teacher_profile,
                section_id=target_section_id
            ).exists()
            if not teaches_section:
                return Response({"error": "You do not teach this section"}, status=403)

        msg = Message.objects.create(
            title=title,
            message=message,
            sent_by=user,
            sender_type=user.role,
            target_section_id=target_section_id if target_section_id else None
        )

        serializer = MessageSerializer(msg)
        return Response(serializer.data, status=201)


class InboxView(APIView):
    """
    Students and teachers call this to get their messages.
    Returns admin broadcasts + messages targeted at their section.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'student':
            try:
                section = user.student_profile.section
            except Exception:
                return Response({"error": "Student profile not found"}, status=404)

            # Get admin broadcasts (no section) + messages for their section
            messages = Message.objects.filter(
                models.Q(target_section=None) |
                models.Q(target_section=section)
            ).order_by('-created_at')

        elif user.role == 'teacher':
            try:
                teacher_profile = user.teacher_profile
            except Exception:
                return Response({"error": "Teacher profile not found"}, status=404)

            from api.models import TeachingAssignment
            teacher_sections = TeachingAssignment.objects.filter(
                teacher=teacher_profile
            ).values_list('section_id', flat=True)

            # Admin broadcasts + messages for sections this teacher teaches
            messages = Message.objects.filter(
                models.Q(target_section=None) |
                models.Q(target_section__in=teacher_sections)
            ).order_by('-created_at')

        elif user.role == 'admin':
            messages = Message.objects.all().order_by('-created_at')

        else:
            return Response({"error": "Unknown role"}, status=403)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


# fix the missing .objects.all() that was in your original views
class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]