from django.db import models
from django.contrib.auth.models import AbstractUser




class UserModel(AbstractUser):
    Role_choices = [
        ('student','s'),
        ('teacher','t'),
        ('admin','a'),
    ]
    role = models.CharField(max_length=20,choices=Role_choices)