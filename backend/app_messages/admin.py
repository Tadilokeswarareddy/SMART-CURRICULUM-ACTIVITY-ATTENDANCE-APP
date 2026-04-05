from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'sender_type', 'sent_by', 'target_section', 'created_at']
    list_filter = ['sender_type', 'target_section']
    search_fields = ['title', 'message']