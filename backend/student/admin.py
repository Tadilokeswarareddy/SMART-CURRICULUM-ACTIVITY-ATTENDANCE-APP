from django.contrib import admin
from .models import StudentModel, SmartTask


@admin.register(StudentModel)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['roll_number', 'get_name', 'section', 'phone_number']
    search_fields = ['roll_number', 'user__first_name', 'user__last_name']
    # profile_picture shows as an upload field automatically in admin
    fields = ['user', 'roll_number', 'phone_number', 'section', 'profile_picture']

    def get_name(self, obj):
        return str(obj)
    get_name.short_description = 'Name'


admin.site.register(SmartTask)