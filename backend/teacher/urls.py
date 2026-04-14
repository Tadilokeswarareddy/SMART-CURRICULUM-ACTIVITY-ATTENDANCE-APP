from django.urls import path
from .views import TeacherModelview, TeacherDetailview
from .views import AllTeachersView


urlpatterns = [
    path('teacher/', TeacherModelview.as_view()),
    path('teacher/<int:pk>/', TeacherDetailview.as_view()),
    path('teachers/', AllTeachersView.as_view()),
 
]