from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count

from .models import StudentModel, SmartTask, TaskSubmission
from .serializers import StudentSerializer, StudentAttendanceSummarySerializer, TaskSubmissionSerializer
from .llm import generate_task_from_llm, review_submission_with_gemini
from api.models import Attendance


class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]  # FIX: block anonymous users entirely

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == 'admin':
            serializer.save()
        elif user.role == 'student':
            serializer.save(user=user)
        else:
            serializer.save()


class StudentDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentSerializer


class StudentAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # FIX: guard against missing student profile (e.g. teacher hits this endpoint)
        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        attendance_qs = Attendance.objects.filter(student=student).select_related(
            'session__assignment__subject',
            'session__assignment__teacher'
        )

        summary = {}

        for record in attendance_qs:
            assignment = record.session.assignment
            subject = assignment.subject
            teacher = assignment.teacher
            key = subject.id

            if key not in summary:
                summary[key] = {
                    "subject_name": subject.name,
                    "subject_code": subject.code,
                    "teacher_name": str(teacher),
                    "present_classes": 0,
                    "total_classes": 0,
                }

            summary[key]["total_classes"] += 1
            if record.status:
                summary[key]["present_classes"] += 1

        result = []
        for data in summary.values():
            percentage = (
                (data["present_classes"] / data["total_classes"]) * 100
                if data["total_classes"] > 0 else 0
            )
            result.append({
                **data,
                "attendance_percentage": round(percentage, 2)
            })

        serializer = StudentAttendanceSummarySerializer(result, many=True)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_task(request):
    existing_tasks = SmartTask.objects.filter(student=request.user, completed=False)
    if existing_tasks.exists():
        return Response([
            {"id": t.id, "title": t.title, "description": t.description, "duration": t.duration}
            for t in existing_tasks
        ])
    data_list = generate_task_from_llm()
    created_tasks = []
    for item in data_list[:5]:
        task = SmartTask.objects.create(
            student=request.user,
            title=item["title"],
            description=item["description"],
            duration=item["duration"]
        )
        created_tasks.append({"id": task.id, "title": task.title, "description": task.description, "duration": task.duration})
    return Response(created_tasks)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_task(request):
    task_id = request.data.get("task_id")
    if not task_id:
        return Response({"error": "task_id is required"}, status=400)
    try:
        task = SmartTask.objects.get(id=task_id, student=request.user)
    except SmartTask.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)
    task.completed = True
    task.save()
    return Response({"message": "Task marked as completed"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_task_file(request):
    """
    Accepts: task_id (form field) + file (multipart)
    Sends file to Gemini, saves score, returns score.
    """
    task_id = request.data.get("task_id")
    uploaded_file = request.FILES.get("file")

    if not task_id or not uploaded_file:
        return Response({"error": "task_id and file are required"}, status=400)

    # Validate mime type
    allowed_types = ["image/png", "image/jpeg", "application/pdf", "text/plain"]
    mime_type = uploaded_file.content_type
    if mime_type not in allowed_types:
        return Response({"error": f"File type '{mime_type}' not allowed."}, status=400)

    try:
        task = SmartTask.objects.get(id=task_id, student=request.user)
    except SmartTask.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

    file_bytes = uploaded_file.read()
    score = review_submission_with_gemini(file_bytes, mime_type, task.title, task.description)

    # Save or update submission
    submission, _ = TaskSubmission.objects.update_or_create(
        task=task,
        defaults={"student": request.user, "score": score, "file": uploaded_file}
    )

    return Response({"score": score, "task_id": task.id})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_task_stats(request):
    """
    Returns overall score average + completed count for the logged-in student.
    """
    completed = SmartTask.objects.filter(student=request.user, completed=True).count()
    avg_score = TaskSubmission.objects.filter(
        student=request.user, score__isnull=False
    ).aggregate(avg=Avg("score"))["avg"]

    return Response({
        "completed_tasks": completed,
        "average_score": round(avg_score, 1) if avg_score else None,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_student_stats(request):
    """
    For teachers: returns all students with their task stats.
    Only accessible if user.role == 'teacher'.
    """
    if request.user.role != 'teacher':
        return Response({"error": "Forbidden"}, status=403)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    students = User.objects.filter(role='student')
    result = []

    for student in students:
        completed = SmartTask.objects.filter(student=student, completed=True).count()
        avg = TaskSubmission.objects.filter(
            student=student, score__isnull=False
        ).aggregate(avg=Avg("score"))["avg"]

        result.append({
            "student_id": student.id,
            "name": student.get_full_name() or student.username,
            "email": student.email,
            "completed_tasks": completed,
            "average_score": round(avg, 1) if avg else None,
        })

    return Response(result)
