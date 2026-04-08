from django.urls import path
from .views import (
    StudentModelView, StudentDetailview,
    generate_task, complete_task,
    submit_task_file, student_task_stats, teacher_student_stats,
    StudentAttendanceView
)

urlpatterns = [
    path('students/', StudentModelView.as_view()),
    path('students/<int:pk>/', StudentDetailview.as_view()),
    path('task/generate/', generate_task),
    path('task/complete/', complete_task),
    path('task/submit/', submit_task_file),        # NEW
    path('task/stats/', student_task_stats),       # NEW
    path('task/teacher-stats/', teacher_student_stats),  # NEW
    path('attendance/', StudentAttendanceView.as_view()),
]