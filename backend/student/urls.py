from django.urls import path
from .views import StudentModelView, StudentDetailview, generate_task, complete_task, StudentAttendanceView

urlpatterns = [
    path('students/', StudentModelView.as_view()),
    path('students/<int:pk>/', StudentDetailview.as_view()),  # fixed trailing slash
    path('task/generate/', generate_task),
    path('task/complete/', complete_task),
    path('attendance/', StudentAttendanceView.as_view()),
]