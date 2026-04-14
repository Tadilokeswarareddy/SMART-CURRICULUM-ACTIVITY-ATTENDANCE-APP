from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg

from .models import StudentModel, SmartTask, TaskSubmission
from .serializers import (
    StudentSerializer,
    StudentAttendanceSummarySerializer,
    TaskSubmissionSerializer,
)
from .llm import generate_task_from_llm, review_submission_with_gemini
from api.models import Attendance



class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

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
        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=404)

        attendance_qs = Attendance.objects.filter(student=student).select_related(
            'session__assignment__subject',
            'session__assignment__teacher',
        )

        summary = {}
        for record in attendance_qs:
            assignment = record.session.assignment
            subject    = assignment.subject
            teacher    = assignment.teacher
            key        = subject.id
            if key not in summary:
                summary[key] = {
                    "subject_name":  subject.name,
                    "subject_code":  subject.code,
                    "teacher_name":  str(teacher),
                    "present_classes": 0,
                    "total_classes":   0,
                }
            summary[key]["total_classes"] += 1
            if record.status:
                summary[key]["present_classes"] += 1

        result = []
        for data in summary.values():
            pct = (
                (data["present_classes"] / data["total_classes"]) * 100
                if data["total_classes"] > 0 else 0
            )
            result.append({**data, "attendance_percentage": round(pct, 2)})

        serializer = StudentAttendanceSummarySerializer(result, many=True)
        return Response(serializer.data)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_task(request):
    """
    Return existing incomplete tasks if they exist (preserves state across
    page navigation), otherwise generate 5 fresh ones from Gemini.
    """
    existing_tasks = SmartTask.objects.filter(
        student=request.user,
        completed=False,
    ).prefetch_related('submission')

    if existing_tasks.exists():
        return Response([
            {
                "id":          task.id,
                "title":       task.title,
                "description": task.description,
                "duration":    task.duration,
                "saved_score": task.submission.score
                               if hasattr(task, 'submission') else None,
            }
            for task in existing_tasks
        ])

    data_list     = generate_task_from_llm()
    created_tasks = []
    for item in data_list[:5]:
        task = SmartTask.objects.create(
            student     = request.user,
            title       = item["title"],
            description = item["description"],
            duration    = item["duration"],
        )
        created_tasks.append({
            "id":          task.id,
            "title":       task.title,
            "description": task.description,
            "duration":    task.duration,
            "saved_score": None,
        })
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
    task_id       = request.data.get("task_id")
    uploaded_file = request.FILES.get("file")

    if not task_id or not uploaded_file:
        return Response({"error": "task_id and file are required"}, status=400)

    allowed_types = ["image/png", "image/jpeg", "application/pdf", "text/plain"]
    mime_type     = uploaded_file.content_type
    if mime_type not in allowed_types:
        return Response(
            {"error": f"File type '{mime_type}' not allowed."}, status=400
        )

    try:
        task = SmartTask.objects.get(id=task_id, student=request.user)
    except SmartTask.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)


    file_bytes = uploaded_file.read()

    score, remark = review_submission_with_gemini(
        file_bytes, mime_type, task.title, task.description
    )



    uploaded_file.seek(0)

    submission, created = TaskSubmission.objects.update_or_create(
        task     = task,
        defaults = {
            "student": request.user,
            "score":   score,
            "file":    uploaded_file,
        },
    )

    return Response({"score": score, "task_id": task.id, "remark": remark})



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_task_stats(request):
    completed = SmartTask.objects.filter(
        student=request.user, completed=True
    ).count()

    avg_score = TaskSubmission.objects.filter(
        student=request.user, score__isnull=False
    ).aggregate(avg=Avg("score"))["avg"]

    return Response({
        "completed_tasks": completed,
        "average_score":   round(avg_score, 1) if avg_score else None,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_student_stats(request):
    if request.user.role != 'teacher':
        return Response({"error": "Forbidden"}, status=403)

    from api.models import TeachingAssignment, Attendance

    teacher_assignments = TeachingAssignment.objects.filter(
        teacher=request.user.teacher_profile
    ).select_related('section', 'section__branch').distinct()

    seen_sections = {}
    for a in teacher_assignments:
        sec = a.section
        if sec.id not in seen_sections:
            seen_sections[sec.id] = {
                "id":     sec.id,
                "name":   sec.name,
                "branch": sec.branch.name,
            }
    sections = list(seen_sections.values())

    section_id         = request.GET.get("section_id")
    taught_section_ids = list(seen_sections.keys())

    students_qs = StudentModel.objects.select_related(
        'user', 'section', 'section__branch'
    )
    if section_id:
        students_qs = students_qs.filter(section_id=section_id)
    else:
        students_qs = students_qs.filter(section_id__in=taught_section_ids)

    result = []
    for student in students_qs:
        completed = SmartTask.objects.filter(
            student=student.user, completed=True
        ).count()
        avg = TaskSubmission.objects.filter(
            student=student.user, score__isnull=False
        ).aggregate(avg=Avg("score"))["avg"]

        assignments_for_section = TeachingAssignment.objects.filter(
            teacher=request.user.teacher_profile,
            section=student.section,
        ).select_related('subject')

        attendance_by_subject = []
        for assignment in assignments_for_section:
            records = Attendance.objects.filter(
                student=student,
                session__assignment=assignment,
            )
            total   = records.count()
            present = records.filter(status=True).count()
            pct     = round((present / total) * 100, 1) if total > 0 else 0
            attendance_by_subject.append({
                "subject_name": assignment.subject.name,
                "subject_code": assignment.subject.code,
                "present":      present,
                "total":        total,
                "percentage":   pct,
            })

        result.append({
            "student_id":      student.user.id,
            "name":            student.user.get_full_name() or student.user.username,
            "email":           student.user.email,
            "roll_number":     student.roll_number or "—",
            "section_id":      student.section.id        if student.section else None,
            "section_name":    student.section.name      if student.section else "—",
            "branch_name":     student.section.branch.name if student.section else "—",
            "completed_tasks": completed,
            "average_score":   round(avg, 1) if avg else None,
            "attendance":      attendance_by_subject,
        })

    # ← this return must be at function level, NOT inside any if/for block
    return Response({"sections": sections, "students": result})