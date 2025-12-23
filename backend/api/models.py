from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid



class UserModel(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Branch(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Year(models.Model):
    YEAR_CHOICES = (
        (1, "1st Year"),
        (2, "2nd Year"),
        (3, "3rd Year"),
        (4, "4th Year"),
    )
    year = models.IntegerField(choices=YEAR_CHOICES)

    def __str__(self):
        return str(self.year)


class Section(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    year = models.ForeignKey(Year, on_delete=models.CASCADE)
    name = models.CharField(max_length=5)

    class Meta:
        unique_together = ('branch', 'year', 'name')

    def __str__(self):
        return f"{self.branch}-{self.year}-{self.name}"

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    year = models.ForeignKey(Year, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class TeachingAssignment(models.Model):
    teacher = models.ForeignKey('teacher.TeacherModel', on_delete=models.CASCADE)
    subject = models.ForeignKey('api.Subject', on_delete=models.CASCADE)
    section = models.ForeignKey('api.Section', on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['teacher', 'subject', 'section'],
                name='unique_teacher_subject_section'
            )
        ]

    def __str__(self):
        return f"{self.teacher} - {self.subject} - {self.section}"

    

class TimeTable(models.Model):
    DAYS = (
        ('mon', 'Monday'),
        ('tue', 'Tuesday'),
        ('wed', 'Wednesday'),
        ('thu', 'Thursday'),
        ('fri', 'Friday'),
    )

    assignment = models.ForeignKey(TeachingAssignment, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.assignment} - {self.day}"
    
class AttendanceSession(models.Model):
    assignment = models.ForeignKey(TeachingAssignment, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    start_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True)

    def __str__(self):
        return f"{self.assignment} - {self.date}"

class Attendance(models.Model):
    student = models.ForeignKey('student.StudentModel', on_delete=models.CASCADE)
    session = models.ForeignKey('api.AttendanceSession', on_delete=models.CASCADE)
    status = models.BooleanField(default=False)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'session'],
                name='unique_student_session'
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.status}"
