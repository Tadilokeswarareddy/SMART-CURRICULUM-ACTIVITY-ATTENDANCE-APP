from django.db import models
from django.conf import settings


class StudentModel(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True
    )
    phone_number = models.CharField(max_length=15)
    roll_number = models.CharField(max_length=50, unique=True, null=True)
    section = models.ForeignKey(
        'api.Section',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    profile_picture = models.ImageField(
        upload_to='student_pics/',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.roll_number} - {self.user.get_full_name() or self.user.username}"


class SectionTask(models.Model):
    teaching_assignment = models.ForeignKey(
        'api.TeachingAssignment',
        on_delete=models.CASCADE,
        related_name='section_tasks'
    )
    prompt_input = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['teaching_assignment'],
                condition=models.Q(is_active=True),
                name='unique_active_section_task'
            )
        ]

    def __str__(self):
        return f"{self.teaching_assignment} — active:{self.is_active}"


class SmartTask(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.IntegerField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    subject = models.ForeignKey(
        'api.Subject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    section_task = models.ForeignKey(
        SectionTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title


class TaskSubmission(models.Model):
    task = models.OneToOneField(
        SmartTask,
        on_delete=models.CASCADE,
        related_name='submission'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    file = models.FileField(upload_to='task_submissions/')
    score = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.task.title} - {self.score}"