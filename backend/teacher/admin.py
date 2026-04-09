from django.contrib import admin
from django.utils.html import format_html
from .models import TeacherModel


@admin.register(TeacherModel)
class TeacherAdmin(admin.ModelAdmin):
    list_display   = ['get_name', 'employee_id', 'designation', 'department', 'phone_number', 'experience_years', 'profile_pic_preview']
    list_filter    = ['designation', 'department']
    search_fields  = ['user__first_name', 'user__last_name', 'employee_id', 'department']
    ordering       = ['user__first_name']
    autocomplete_fields = ['user']

    # Grouped fieldsets so the form isn't one long wall of fields
    fieldsets = (
        ('Account', {
            'fields': ('user',)
        }),
        ('Basic Info', {
            'fields': ('phone_number', 'employee_id', 'designation', 'department')
        }),
        ('Qualifications', {
            'fields': ('qualification', 'experience_years', 'bio')
        }),
        ('Profile Picture', {
            'fields': ('profile_picture',)
        }),
    )

    def get_name(self, obj):
        return str(obj)
    get_name.short_description = 'Name'

    def profile_pic_preview(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>',
                obj.profile_picture.url
            )
        return '—'
    profile_pic_preview.short_description = 'Photo'