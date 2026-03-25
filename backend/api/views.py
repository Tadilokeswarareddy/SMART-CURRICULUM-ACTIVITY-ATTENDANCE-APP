from django.shortcuts import render
from django.utils import timezone

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    UserModel,
    AttendanceSession,
    Attendance
)

from .serializers import (
    UserModelSerializers,
    MyTokenObtainPairSerializer
)



# Create your views here.

class UserRegisterView(generics.ListCreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserModelSerializers
    permission_classes = [AllowAny]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class StartAttendanceSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only teachers allowed"}, status=403)

        assignment_id = request.data.get("assignment_id")

        session = AttendanceSession.objects.create(
            assignment_id=assignment_id,
            expires_at=timezone.now() + timezone.timedelta(minutes=5)
        )

        return Response({
            "qr_token": session.qr_token,
            "expires_at": session.expires_at
        })

class MarkAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'student':
            return Response({"error": "Only students allowed"}, status=403)

        qr_token = request.data.get("qr_token")

        try:
            session = AttendanceSession.objects.get(qr_token=qr_token, is_active=True)
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Invalid QR"}, status=400)

        if session.is_expired():
            return Response({"error": "QR expired"}, status=400)

        student = request.user.student_profile

        attendance, created = Attendance.objects.get_or_create(
            student=student,
            session=session,
            defaults={"status": True}
        )

        if not created:
            return Response({"message": "Already marked"})

        return Response({"message": "Attendance marked successfully"})
