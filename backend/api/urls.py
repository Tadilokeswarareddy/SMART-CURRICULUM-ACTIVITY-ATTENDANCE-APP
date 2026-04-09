from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegisterView, MyTokenObtainPairView,
    StartAttendanceSession, MarkAttendanceAPIView,
    BranchListCreateView, YearListCreateView,
    SectionListCreateView, SubjectListCreateView,
    TeachingAssignmentListCreateView, TimeTableListCreateView,
    StudentTimetableView, TeacherTimetableView,
    SectionStudentsView, ManualAttendanceView,
    StudentSubjectAttendanceView,
    StudentProfileView, TeacherProfileView,
    SessionAttendanceView, AssignmentSessionsView,
)
from .views import  RefreshQRToken


urlpatterns = [
    # Auth
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegisterView.as_view()),

    # Setup
    path('branches/', BranchListCreateView.as_view()),
    path('years/', YearListCreateView.as_view()),
    path('sections/', SectionListCreateView.as_view()),
    path('subjects/', SubjectListCreateView.as_view()),
    path('assignments/', TeachingAssignmentListCreateView.as_view()),
    path('timetable/', TimeTableListCreateView.as_view()),

    # Timetables
    path('timetable/student/', StudentTimetableView.as_view()),
    path('timetable/teacher/', TeacherTimetableView.as_view()),

    # Attendance
    path('attendance/start/', StartAttendanceSession.as_view()),
    path('attendance/mark/', MarkAttendanceAPIView.as_view()),
    path('attendance/manual/', ManualAttendanceView.as_view()),
    path('attendance/student/', StudentSubjectAttendanceView.as_view()),
    path('attendance/sessions/', AssignmentSessionsView.as_view()),           # GET ?assignment_id=
    path('attendance/session/<int:session_id>/', SessionAttendanceView.as_view()),
    path('attendance/refresh-qr/', RefreshQRToken.as_view()),
  # GET session detail

    # Section students (for teacher)
    path('sections/<int:section_id>/students/', SectionStudentsView.as_view()),

    # Profiles
    path('profile/student/', StudentProfileView.as_view()),
    path('profile/teacher/', TeacherProfileView.as_view()),

    # Other apps
    path('', include('app_messages.urls')),
    path('', include('student.urls')),
    path('', include('teacher.urls')),
]