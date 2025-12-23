from django.contrib import admin
from .models import TeacherMessageModel,MessageModel
# Register your models here.
admin.site.register(TeacherMessageModel)
admin.site.register(MessageModel)
