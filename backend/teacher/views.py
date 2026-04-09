from django.shortcuts import render
from rest_framework import generics
from .models import TeacherModel
from .serializers import TeacherModelSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated



# Create your views here.

class TeacherModelview(generics.ListCreateAPIView):
    queryset = TeacherModel.objects.all()
    serializer_class = TeacherModelSerializer

class TeacherDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherModel.objects.all()
    serializer_class = TeacherModelSerializer


class AllTeachersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teachers = TeacherModel.objects.select_related('user').all()
        data = [
            {
                "id": t.id,
                "username": t.user.username,
                "full_name": t.user.get_full_name() or t.user.username,
                "email": t.user.email,
                "phone_number": t.phone_number,
                "employee_id": t.employee_id,
                "designation": t.designation,
                "department": t.department,
                "qualification": t.qualification,
                "experience_years": t.experience_years,
            }
            for t in teachers
        ]
        return Response(data)
