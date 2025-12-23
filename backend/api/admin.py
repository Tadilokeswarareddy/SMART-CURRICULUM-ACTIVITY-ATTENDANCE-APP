from django.contrib import admin
from .models import (
    UserModel, Branch, Year, Subject, 
    TeachingAssignment, TimeTable, AttendanceSession, Attendance,Section
)

admin.site.register(UserModel)
admin.site.register(Branch)
admin.site.register(Year)
admin.site.register(Subject)
admin.site.register(TeachingAssignment)
admin.site.register(TimeTable)
admin.site.register(AttendanceSession)
admin.site.register(Attendance)
admin.site.register(Section)