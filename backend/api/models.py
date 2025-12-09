from django.db import models
from django.contrib.auth.models import AbstractUser

class UserModel(AbstractUser):
    Role_choices = [
        ('student','s'),
        ('teacher','t'),
        ('admin','a'),
    ]
    role = models.CharField(max_length=20,choices=Role_choices)

class StudentModel(models.Model):
    course_choice = [
        ('CSE1','CSE1'),
        ('CSE2','CSE2'),
        ('CSE3','CSE3'),
        ('CSE4','CSE4')
    ]
    id = models.AutoField(primary_key=True)
    phone_number = models.IntegerField()
    course = models.CharField(max_length=20,choices=course_choice)
    owner = models.ForeignKey(UserModel,on_delete=models.CASCADE)

class TeacherModel(models.Model):
    subject = [
        ('python','python'),
        ('cpp','cpp'),
        ('java','java'),
        ('frontend','frontend'),
        ('sql','sql')
    ]
    id = models.AutoField(primary_key=True)
    phone_number = models.IntegerField()
    subject = models.CharField(max_length=20,choices=subject)
    owner = models.ForeignKey(UserModel,on_delete=models.CASCADE)








