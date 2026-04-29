from django.urls import path
from .views import SendMessageView, InboxView, MessageDetailView, SectionStudentsView

urlpatterns = [
    path('messages/send/',                          SendMessageView.as_view()),
    path('messages/inbox/',                         InboxView.as_view()),
    path('messages/<int:pk>/',                      MessageDetailView.as_view()),
    path('messages/sections/<int:section_id>/students/', SectionStudentsView.as_view()),
]