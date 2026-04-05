from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserModel, Branch, Year, Section, Subject, TeachingAssignment, TimeTable, AttendanceSession, Attendance


@admin.register(UserModel)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role']
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )

admin.site.register(Branch)
admin.site.register(Year)
admin.site.register(Section)
admin.site.register(Subject)
admin.site.register(TeachingAssignment)
admin.site.register(TimeTable)
admin.site.register(AttendanceSession)
admin.site.register(Attendance)