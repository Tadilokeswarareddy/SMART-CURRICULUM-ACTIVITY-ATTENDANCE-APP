from rest_framework import generics
from .models import StudentModel
from .serializers import StudentModelSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SmartTask
from .llm import generate_task_from_llm


class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentModelSerializer

class StudentDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentModel
    serializer_class = StudentModelSerializer


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
    

    # 3️⃣ Save task
    task = SmartTask.objects.create(
        student=request.user,
        title=data["title"],
        description=data["description"],
        duration=data["duration"]
    )

    # 4️⃣ Send to frontend
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
