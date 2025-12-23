from django.urls import path
from .views import TeacherModelview,TeacherDetailview

urlpatterns=[
    path('teacher/',TeacherModelview.as_view()),
    path('teacher/<int:pk>',TeacherDetailview.as_view()),
    
]