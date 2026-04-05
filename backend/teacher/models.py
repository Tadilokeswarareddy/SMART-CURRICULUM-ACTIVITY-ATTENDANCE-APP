from django.db import models
from django.conf import settings


class TeacherModel(models.Model):
    DESIGNATION_CHOICES = [
        ('professor', 'Professor'),
        ('associate_professor', 'Associate Professor'),
        ('assistant_professor', 'Assistant Professor'),
        ('lecturer', 'Lecturer'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    phone_number = models.CharField(max_length=15)
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    designation = models.CharField(max_length=30, choices=DESIGNATION_CHOICES, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    qualification = models.CharField(max_length=200, null=True, blank=True)  # e.g. M.Tech, PhD
    experience_years = models.PositiveIntegerField(default=0)
    profile_picture = models.ImageField(upload_to='teacher_pics/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username