from django.db import models
from api.models import UserModel
from django.conf import settings

# Create your models here.
class StudentModel(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True
    )
    phone_number = models.CharField(max_length=15)
    roll_number = models.CharField(max_length=50, unique=True,null=True)

    def __str__(self):
        return f"{self.roll_number} - {self.user.get_full_name() or self.user.username}"

