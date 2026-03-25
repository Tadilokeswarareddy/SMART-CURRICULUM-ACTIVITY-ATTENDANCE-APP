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
# views.py

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_task(request):
    # 1. Check for ANY incomplete tasks
    existing_tasks = SmartTask.objects.filter(
        student=request.user,
        completed=False
    )

    # 2. If there are still tasks to do, return them
    if existing_tasks.exists():
        print(f"✅ Found {existing_tasks.count()} existing tasks, skipping Gemini call.")
        return Response([
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "duration": task.duration
            } for task in existing_tasks
        ])

    # 3. If no tasks left, generate 5 new ones
    print("🔍 No tasks found. Requesting 5 new tasks from Gemini...")
    data_list = generate_task_from_llm() # This now returns a list

    created_tasks = []
    # Take only the first 5 in case LLM generates more
    for item in data_list[:5]:
        task = SmartTask.objects.create(
            student=request.user,
            title=item["title"],
            description=item["description"],
            duration=item["duration"]
        )
        created_tasks.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "duration": task.duration
        })

    return Response(created_tasks)
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
