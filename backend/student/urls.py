from django.urls import path
from .views import StudentModelView,StudentDetailview,generate_task,complete_task

urlpatterns=[
    path('students/',StudentModelView.as_view()),
    path('students/<int:pk>',StudentDetailview.as_view()),
    path("task/generate/", generate_task),
    path("task/complete/", complete_task),

    
]