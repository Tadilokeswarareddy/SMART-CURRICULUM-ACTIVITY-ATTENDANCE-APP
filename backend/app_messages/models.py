from django.db import models
from django.conf import settings


class Message(models.Model):
    SENDER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
    ]

    title       = models.CharField(max_length=100)
    message     = models.TextField()
    sent_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPE_CHOICES)

    target_sections = models.ManyToManyField(
        'api.Section',
        blank=True,
        related_name='section_messages'
    )
    target_students = models.ManyToManyField(
        'student.StudentModel',      
        blank=True,
        related_name='student_messages'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender_type.upper()} - {self.title}"