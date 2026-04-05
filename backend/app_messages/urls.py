from django.urls import path
from .views import SendMessageView, InboxView, MessageDetailView

urlpatterns = [
    path('messages/send/', SendMessageView.as_view()),
    path('messages/inbox/', InboxView.as_view()),
    path('messages/<int:pk>/', MessageDetailView.as_view()),
]