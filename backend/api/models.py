from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid
def generate_qr_token():
    return uuid.uuid4().hex

#user model
class UserModel(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


#Course model for sem uni year etc
class Course(models.Model):

    code = models.CharField(max_length=20, unique=True)  
    name = models.CharField(max_length=100)              

    def __str__(self):
        return f"{self.code} - {self.name}"


#subjects in a sem or particular year students
class Subject(models.Model):

    name = models.CharField(max_length=100)        
    course_code = models.CharField(max_length=20)  
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='subjects'
    )

    def __str__(self):
        return f"{self.course_code} - {self.name}"



class StudentModel(models.Model):
    user = models.OneToOneField(
        UserModel,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True
    )
    phone_number = models.CharField(max_length=15)
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='students'
    )
    roll_number = models.CharField(max_length=50, unique=True,null=True)

    def __str__(self):
        return f"{self.roll_number} - {self.user.get_full_name() or self.user.username}"


class TeacherModel(models.Model):

    user = models.OneToOneField(
        UserModel,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    phone_number = models.CharField(max_length=15)

    def __str__(self):
        return self.user.get_full_name() or self.user.username



class ClassGroup(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='class_groups'
    )
    section = models.CharField(max_length=10, blank=True)  
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='class_groups'
    )
    teacher = models.ForeignKey(
        TeacherModel,
        on_delete=models.CASCADE,
        related_name='class_groups'
    )


    students = models.ManyToManyField(
        StudentModel,
        through='Enrollment',
        related_name='class_groups'
    )

    def __str__(self):
        return f"{self.course.code}-{self.section} | {self.subject.course_code} | {self.teacher}"


class Enrollment(models.Model):
    """
    Connects students to the ClassGroup they belong to.
    """
    student = models.ForeignKey(
        StudentModel,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    date_enrolled = models.DateField(default=timezone.now)

    class Meta:
        unique_together = ('student', 'class_group')

    def __str__(self):
        return f"{self.student} in {self.class_group}"


# ============ TIMETABLE ============

class TimeTableSlot(models.Model):
    """
    Represents a single period in the timetable.
    For example: Monday, Period 2, 10:00–10:50, ClassGroup (CSE1-A Python).
    """

    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        related_name='timetable_slots'
    )
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    period_number = models.PositiveIntegerField()  # 1, 2, 3...
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day_of_week', 'period_number']
        unique_together = ('class_group', 'day_of_week', 'period_number')

    def __str__(self):
        return f"{self.get_day_of_week_display()} P{self.period_number} - {self.class_group}"


# ============ ATTENDANCE (QR-BASED) ============

class AttendanceSession(models.Model):
    """
    One session = one actual class occurrence on some date.
    Example: Python for CSE1-A on 2025-12-10, period 3.

    QR code will encode qr_token for this session.
    """
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )
    timetable_slot = models.ForeignKey(
        TimeTableSlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendance_sessions'
    )
    date = models.DateField(default=timezone.now)

    qr_token = models.CharField(
    max_length=64,
    unique=True,
    default=generate_qr_token  
    )

    is_active = models.BooleanField(default=True)  # can close it after class
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_group', 'date', 'timetable_slot')

    def __str__(self):
        return f"Session: {self.class_group} on {self.date}"


class AttendanceRecord(models.Model):
    """
    One record per student per session.
    """

    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    student = models.ForeignKey(
        StudentModel,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='present'
    )
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'student')

    def __str__(self):
        return f"{self.student} - {self.session} - {self.status}"




#message model









