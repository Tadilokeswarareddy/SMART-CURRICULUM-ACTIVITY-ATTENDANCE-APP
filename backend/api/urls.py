from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path,include
from .views import UserRegisterView,MyTokenObtainPairView
from .views import CourseView,CourseDetailView
from .views import SubjectView,SubjectDetailView,StudentModelView,StudentDetailview
from .views import TeacherDetailview,TeacherModelview,ClassGroupView,ClassGroupDetailView
from .views import EnrollmentView,EnrollmentDetailView,TimetableView

urlpatterns = [
    
    path('token/',MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/',UserRegisterView.as_view()),
    path('course/',CourseView.as_view()),
    path('course/<int:pk>/',CourseDetailView.as_view()),
    path('subjects/',SubjectView.as_view()),
    path('subjects/<int:pk>/',SubjectDetailView.as_view()),
    path('students/',StudentModelView.as_view()),
    path('students/<int:pk>',StudentDetailview.as_view()),
    path('teacher/',TeacherModelview.as_view()),
    path('teacher/<int:pk>',TeacherDetailview.as_view()),
    path('classgroup/',ClassGroupView.as_view()),
    path('classgroup/<int:pk>',ClassGroupDetailView.as_view()),
    path('enrollments/',EnrollmentView.as_view()),
    path('enrollment/<int:pk>/',EnrollmentDetailView.as_view()),
    path('timetable/',TimetableView.as_view()),
    path('',include('app_messages.urls')),



    
    
]