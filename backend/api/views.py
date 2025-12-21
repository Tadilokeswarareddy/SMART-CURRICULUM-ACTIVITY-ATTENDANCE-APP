from django.shortcuts import render
from rest_framework import generics
from .models import UserModel,StudentModel,TeacherModel,Course,Subject
from .serializers import UserModelSerializers,StudentModelSerializer,TeacherModelSerializer,SubjectSerilaizer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import ClassGroup,Enrollment,TimeTableSlot
from .serializers import MyTokenObtainPairSerializer,CourseSerilaizer,ClassGroupSerilaizer,EnrollmentSerializer
from .serializers import TimetableSerializer
# Create your views here.

class UserRegisterView(generics.ListCreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserModelSerializers
    permission_classes = [AllowAny]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class StudentModelView(generics.ListCreateAPIView):
    queryset = StudentModel.objects.all()
    serializer_class = StudentModelSerializer

class StudentDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentModel
    serializer_class = StudentModelSerializer

class TeacherModelview(generics.ListCreateAPIView):
    queryset = TeacherModel.objects.all()
    serializer_class = TeacherModelSerializer

class TeacherDetailview(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherModel
    serializer_class = TeacherModelSerializer


class CourseView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerilaizer

class CourseDetailView(generics.RetrieveUpdateAPIView):
    queryset = Course
    serializer_class = CourseSerilaizer

class SubjectView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerilaizer

class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject
    serializer_class = SubjectSerilaizer

class ClassGroupView(generics.ListCreateAPIView):
    queryset = ClassGroup.objects.all()
    serializer_class = ClassGroupSerilaizer

class ClassGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClassGroup
    serializer_class = ClassGroupSerilaizer

class EnrollmentView(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enrollment
    serializer_class = EnrollmentSerializer

class TimetableView(generics.ListCreateAPIView):
    queryset = TimeTableSlot.objects.all()
    serializer_class = TimetableSerializer