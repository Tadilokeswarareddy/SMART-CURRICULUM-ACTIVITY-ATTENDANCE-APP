from django.db import models
from django.conf import settings


class Message(models.Model):
    SENDER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
    ]

    title = models.CharField(max_length=100)
    message = models.TextField()
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPE_CHOICES)

    # Admin can target a section OR leave both null to broadcast to everyone
    # Teacher must always target a section
    target_section = models.ForeignKey(
        'api.Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender_type.upper()} - {self.title}"