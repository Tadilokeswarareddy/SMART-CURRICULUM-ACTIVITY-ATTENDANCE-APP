from .views import (
    StudentModelView, StudentDetailview,
    generate_task, complete_task,
    submit_task_file, student_task_stats, teacher_student_stats,
    StudentAttendanceView,
    upsert_section_task, get_active_section_tasks,  # NEW
)
from django.urls import path


urlpatterns = [
    path('students/', StudentModelView.as_view()),
    path('students/<int:pk>/', StudentDetailview.as_view()),
    path('task/generate/', generate_task),
    path('task/complete/', complete_task),
    path('task/submit/', submit_task_file),
    path('task/stats/', student_task_stats),
    path('task/teacher-stats/', teacher_student_stats),
    path('attendance/', StudentAttendanceView.as_view()),
    path('task/section-task/', upsert_section_task),       
    path('task/section-task/active/', get_active_section_tasks),  
]