from django.urls import path    
from .views import MessageDetailview,MessageView,TeacherMessageView,TeacherMessageDetailview

urlpatterns = [

    path('messages/',MessageView.as_view()),
    path('messages/<int:pk>/',MessageDetailview.as_view()),
    path('teachermessages/',TeacherMessageView.as_view()),
    path('teachermessages/<int:pk>/',TeacherMessageDetailview.as_view()),
]