from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display   = ['title', 'sender_type', 'sent_by', 'created_at']
    list_filter    = ['sender_type', 'created_at']
    search_fields  = ['title', 'message', 'sent_by__username']
    readonly_fields = ['created_at']
    ordering       = ['-created_at']

    fieldsets = (
        ('Message', {
            'fields': ('title', 'message')
        }),
        ('Sender', {
            'fields': ('sent_by', 'sender_type')
        }),
        ('Target', {
            'description': 'Leave blank to broadcast to everyone.',
            'fields': ('target_sections', 'target_students')
        }),
    )