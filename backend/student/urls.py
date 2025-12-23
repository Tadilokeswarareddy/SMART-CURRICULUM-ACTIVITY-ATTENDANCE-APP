from django.urls import path
from .views import StudentModelView,StudentDetailview

urlpatterns=[
    path('students/',StudentModelView.as_view()),
    path('students/<int:pk>',StudentDetailview.as_view()),
]