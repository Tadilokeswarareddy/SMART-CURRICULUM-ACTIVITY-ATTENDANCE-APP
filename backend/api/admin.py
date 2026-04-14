from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import (
    UserModel, Branch, Year, Section, Subject,
    TeachingAssignment, TimeTable,
    AttendanceSession, Attendance,
)



admin.site.site_header  = "College Admin"
admin.site.site_title   = "College Admin"
admin.site.index_title  = "Manage Everything"

@admin.register(UserModel)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'get_full_name', 'email', 'role', 'is_active', 'is_staff']
    list_filter   = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering      = ['role', 'username']
    fieldsets     = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )

    def get_full_name(self, obj):
        return obj.get_full_name() or '—'
    get_full_name.short_description = 'Full Name'




@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display  = ['name']
    search_fields = ['name']


@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ['year']



@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display  = ['__str__', 'branch', 'year', 'name']
    list_filter   = ['branch', 'year']
    search_fields = ['name', 'branch__name']
    ordering      = ['branch', 'year', 'name']




@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display  = ['name', 'code', 'branch', 'year', 'has_syllabus']
    list_filter   = ['branch', 'year']
    search_fields = ['name', 'code']
    ordering      = ['branch', 'year', 'name']
    fields        = ['name', 'code', 'branch', 'year', 'syllabus_pdf', 'syllabus_description']

    def has_syllabus(self, obj):
        return bool(obj.syllabus_pdf)
    has_syllabus.boolean     = True
    has_syllabus.short_description = 'Syllabus'



class TimeTableInline(admin.TabularInline):
    model  = TimeTable
    extra  = 3          
    fields = ['day', 'start_time', 'end_time']




@admin.register(TeachingAssignment)
class TeachingAssignmentAdmin(admin.ModelAdmin):
    list_display  = ['teacher', 'subject', 'section', 'timetable_slots']
    list_filter   = ['section__branch', 'section__year', 'subject']
    search_fields = ['teacher__user__first_name', 'teacher__user__last_name', 'subject__name']
    ordering      = ['section', 'subject']
    inlines       = [TimeTableInline]
    autocomplete_fields = ['teacher', 'subject', 'section']

    def timetable_slots(self, obj):
        slots = TimeTable.objects.filter(assignment=obj).order_by('day', 'start_time')
        if not slots:
            return format_html('<span style="color:#aaa">No slots</span>')
        parts = [
            f"{s.get_day_display()} {s.start_time.strftime('%H:%M')}–{s.end_time.strftime('%H:%M')}"
            for s in slots
        ]
        return " | ".join(parts)
    timetable_slots.short_description = 'Timetable'




@admin.register(TimeTable)
class TimeTableAdmin(admin.ModelAdmin):
    list_display  = ['assignment', 'day', 'start_time', 'end_time']
    list_filter   = ['day', 'assignment__section__branch', 'assignment__section__year']
    search_fields = ['assignment__subject__name', 'assignment__teacher__user__first_name']
    ordering      = ['assignment__section', 'day', 'start_time']



class AttendanceInline(admin.TabularInline):
    model         = Attendance
    extra         = 0
    fields        = ['student', 'status', 'marked_at']
    readonly_fields = ['marked_at']
    can_delete    = False


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display   = ['id', 'assignment', 'date', 'is_active', 'is_expired_display', 'present_count', 'total_count']
    list_filter    = ['is_active', 'date', 'assignment__section__branch']
    search_fields  = ['assignment__subject__name', 'assignment__teacher__user__first_name']
    readonly_fields = ['qr_token', 'start_time', 'expires_at']
    ordering       = ['-date', '-start_time']
    inlines        = [AttendanceInline]

    def is_expired_display(self, obj):
        expired = obj.is_expired()
        color   = '#dc2626' if expired else '#16a34a'
        label   = 'Expired' if expired else 'Active'
        return format_html('<span style="color:{};font-weight:600">{}</span>', color, label)
    is_expired_display.short_description = 'Status'

    def present_count(self, obj):
        return Attendance.objects.filter(session=obj, status=True).count()
    present_count.short_description = 'Present'

    def total_count(self, obj):
        return Attendance.objects.filter(session=obj).count()
    total_count.short_description = 'Total'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display   = ['student', 'session', 'status', 'marked_at']
    list_filter    = ['status', 'session__assignment__section__branch', 'session__date']
    search_fields  = ['student__user__first_name', 'student__user__last_name', 'student__roll_number']
    readonly_fields = ['marked_at']
    ordering       = ['-session__date', 'student']