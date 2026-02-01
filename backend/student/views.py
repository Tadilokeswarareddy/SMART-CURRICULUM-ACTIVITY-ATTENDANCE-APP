from rest_framework import generics
from .models import StudentModel
from .serializers import StudentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SmartTask
from .llm import generate_task_from_llm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Attendance
from .serializers import StudentAttendanceSummarySerializer



# views.py


class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_anonymous:
            serializer.save()
            return

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
        student = request.user.student_profile

        attendance_qs = Attendance.objects.filter(student=student)

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



#llm
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_task(request):
    print(f"--- Request received from {request.user} ---")
    
    existing = SmartTask.objects.filter(
        student=request.user,
        completed=False
    ).first()

    if existing:
        print(f"✅ Found existing task ID {existing.id}, skipping Gemini call.")
        return Response({
            "id": existing.id,
            "title": existing.title,
            "description": existing.description,
            "duration": existing.duration
        })

    print("🔍 No existing task found. Proceeding to Gemini...")
    data = generate_task_from_llm()
    


    task = SmartTask.objects.create(
        student=request.user,
        title=data["title"],
        description=data["description"],
        duration=data["duration"]
    )
    return Response({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "duration": task.duration
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_task(request):
    task_id = request.data.get("task_id")

    if not task_id:
        return Response(
            {"error": "task_id is required"},
            status=400
        )

    try:
        task = SmartTask.objects.get(
            id=task_id,
            student=request.user
        )
    except SmartTask.DoesNotExist:
        return Response(
            {"error": "Task not found"},
            status=404
        )

    task.completed = True
    task.save()

    return Response({"message": "Task marked as completed"})
