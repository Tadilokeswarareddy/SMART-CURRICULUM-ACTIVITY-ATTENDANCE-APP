from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.db import models as dm
from .models import Message
from .serializers import MessageSerializer


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role not in ['admin', 'teacher']:
            return Response({"error": "Only admin or teacher can send messages"}, status=403)

        title       = request.data.get('title', '').strip()
        message     = request.data.get('message', '').strip()
        section_ids = request.data.get('target_sections', [])  # list of ints
        student_ids = request.data.get('target_students', [])  # list of ints

        if not title or not message:
            return Response({"error": "title and message are required"}, status=400)

        if user.role == 'teacher':
            if not section_ids and not student_ids:
                return Response(
                    {"error": "Teachers must target at least one section or student"},
                    status=400
                )

            from api.models import TeachingAssignment
            allowed_sections = set(
                TeachingAssignment.objects.filter(teacher=user.teacher_profile)
                .values_list('section_id', flat=True)
            )

            # Verify teacher teaches every requested section
            for sid in section_ids:
                if int(sid) not in allowed_sections:
                    return Response(
                        {"error": f"You do not teach section {sid}"},
                        status=403
                    )

            # Verify every targeted student belongs to teacher's sections
            if student_ids:
                from student.models import StudentModel
                bad = StudentModel.objects.filter(
                    id__in=student_ids
                ).exclude(section_id__in=allowed_sections)
                if bad.exists():
                    return Response(
                        {"error": "One or more students are not in your sections"},
                        status=403
                    )

        msg = Message.objects.create(
            title=title,
            message=message,
            sent_by=user,
            sender_type=user.role,
        )
        if section_ids:
            msg.target_sections.set(section_ids)
        if student_ids:
            msg.target_students.set(student_ids)

        return Response(MessageSerializer(msg).data, status=201)


class InboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'student':
            try:
                profile = user.student_profile
            except Exception:
                return Response({"error": "Student profile not found"}, status=404)

            messages = Message.objects.filter(
                # broadcast — no sections and no students targeted
                dm.Q(target_sections__isnull=True, target_students__isnull=True) |
                # section-level message that includes this student's section
                dm.Q(target_sections=profile.section) |
                # directly addressed to this student
                dm.Q(target_students=profile)
            ).distinct().order_by('-created_at')

        elif user.role == 'teacher':
            try:
                teacher_profile = user.teacher_profile
            except Exception:
                return Response({"error": "Teacher profile not found"}, status=404)

            from api.models import TeachingAssignment
            teacher_section_ids = TeachingAssignment.objects.filter(
                teacher=teacher_profile
            ).values_list('section_id', flat=True)

            messages = Message.objects.filter(
                dm.Q(target_sections__isnull=True, target_students__isnull=True) |
                dm.Q(target_sections__in=teacher_section_ids)
            ).distinct().order_by('-created_at')

        elif user.role == 'admin':
            messages = Message.objects.all().order_by('-created_at')

        else:
            return Response({"error": "Unknown role"}, status=403)

        return Response(MessageSerializer(messages, many=True).data)


class SectionStudentsView(APIView):
    """Returns students for given section — used by frontend student picker."""
    permission_classes = [IsAuthenticated]

    def get(self, request, section_id):
        from student.models import StudentModel
        from api.models import TeachingAssignment

        user = request.user

        # Teachers can only query their own sections
        if user.role == 'teacher':
            allowed = TeachingAssignment.objects.filter(
                teacher=user.teacher_profile,
                section_id=section_id
            ).exists()
            if not allowed:
                return Response({"error": "You do not teach this section"}, status=403)

        students = (
            StudentModel.objects
            .filter(section_id=section_id)
            .select_related('user')
            .order_by('roll_number')
        )
        data = [
            {
                "id":          s.id,
                "full_name":   s.user.get_full_name() or s.user.username,
                "roll_number": s.roll_number,
            }
            for s in students
        ]
        return Response(data)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Message.objects.all()
    serializer_class   = MessageSerializer
    permission_classes = [IsAuthenticated]