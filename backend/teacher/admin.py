from django.contrib import admin
from .models import TeacherModel


@admin.register(TeacherModel)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'employee_id', 'designation', 'department', 'phone_number']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'department']
    list_filter = ['designation', 'department']

    def get_name(self, obj):
        return str(obj)
    get_name.short_description = 'Name'