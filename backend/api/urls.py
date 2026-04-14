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
    BranchDetailView,YearDetailView,SectionDetailView,SubjectDetailView,TeachingAssignmentDetailView,TimeTableDetailView
)
from .views import  RefreshQRToken
from .views import SessionScansView, SubmitAttendanceView


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegisterView.as_view()),
    path('branches/', BranchListCreateView.as_view()),
    path('years/', YearListCreateView.as_view()),
    path('sections/', SectionListCreateView.as_view()),
    path('subjects/', SubjectListCreateView.as_view()),
    path('assignments/', TeachingAssignmentListCreateView.as_view()),
    path('timetable/', TimeTableListCreateView.as_view()),
    path('timetable/student/', StudentTimetableView.as_view()),
    path('timetable/teacher/', TeacherTimetableView.as_view()),
    path('attendance/start/', StartAttendanceSession.as_view()),
    path('attendance/mark/', MarkAttendanceAPIView.as_view()),
    path('attendance/manual/', ManualAttendanceView.as_view()),
    path('attendance/student/', StudentSubjectAttendanceView.as_view()),
    path('attendance/sessions/', AssignmentSessionsView.as_view()),           # GET ?assignment_id=
    path('attendance/session/<int:session_id>/', SessionAttendanceView.as_view()),
    path('attendance/refresh-qr/', RefreshQRToken.as_view()),
    path('sections/<int:section_id>/students/', SectionStudentsView.as_view()),
    path('profile/student/', StudentProfileView.as_view()),
    path('profile/teacher/', TeacherProfileView.as_view()),
    path('', include('app_messages.urls')),
    path('', include('student.urls')),
    path('', include('teacher.urls')),
    path('branches/<int:pk>/', BranchDetailView.as_view()),
    path('years/<int:pk>/', YearDetailView.as_view()),
    path('sections/<int:pk>/', SectionDetailView.as_view()),
    path('subjects/<int:pk>/', SubjectDetailView.as_view()),
    path('assignments/<int:pk>/', TeachingAssignmentDetailView.as_view()),
    path('timetable/<int:pk>/', TimeTableDetailView.as_view()),
    path('attendance/session/<int:session_id>/scans/', SessionScansView.as_view()),
    path('attendance/submit/', SubmitAttendanceView.as_view()),

]