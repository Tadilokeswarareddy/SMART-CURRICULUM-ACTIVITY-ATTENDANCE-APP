from django.contrib import admin
from django.utils.html import format_html
from .models import StudentModel, SmartTask, TaskSubmission


# ─────────────────────────────────────────────────────────────────
# TaskSubmission inline — see submission score right inside a task
# ─────────────────────────────────────────────────────────────────

class TaskSubmissionInline(admin.StackedInline):
    model         = TaskSubmission
    extra         = 0
    fields        = ['file', 'score', 'submitted_at']
    readonly_fields = ['submitted_at']
    can_delete    = False


# ─────────────────────────────────────────────────────────────────
# Student
# ─────────────────────────────────────────────────────────────────

@admin.register(StudentModel)
class StudentAdmin(admin.ModelAdmin):
    list_display   = ['roll_number', 'get_name', 'get_email', 'section', 'phone_number', 'profile_pic_preview']
    list_filter    = ['section__branch', 'section__year', 'section']
    search_fields  = ['roll_number', 'user__first_name', 'user__last_name', 'user__email']
    ordering       = ['section', 'roll_number']
    fields         = ['user', 'roll_number', 'phone_number', 'section', 'profile_picture']
    autocomplete_fields = ['user', 'section']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    def profile_pic_preview(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>',
                obj.profile_picture.url
            )
        return '—'
    profile_pic_preview.short_description = 'Photo'


# ─────────────────────────────────────────────────────────────────
# SmartTask — with submission score inline
# ─────────────────────────────────────────────────────────────────

@admin.register(SmartTask)
class SmartTaskAdmin(admin.ModelAdmin):
    list_display   = ['title', 'student', 'duration', 'completed', 'get_score', 'created_at']
    list_filter    = ['completed', 'created_at']
    search_fields  = ['title', 'student__username', 'student__first_name']
    readonly_fields = ['created_at']
    ordering       = ['-created_at']
    inlines        = [TaskSubmissionInline]

    def get_score(self, obj):
        try:
            score = obj.submission.score
            if score is None:
                return '—'
            color = '#16a34a' if score >= 8 else '#d97706' if score >= 5 else '#dc2626'
            return format_html('<span style="color:{};font-weight:600">{}/10</span>', color, score)
        except TaskSubmission.DoesNotExist:
            return '—'
    get_score.short_description = 'Score'


# ─────────────────────────────────────────────────────────────────
# TaskSubmission — standalone view for bulk review
# ─────────────────────────────────────────────────────────────────

@admin.register(TaskSubmission)
class TaskSubmissionAdmin(admin.ModelAdmin):
    list_display   = ['student', 'task', 'score_display', 'submitted_at']
    list_filter    = ['submitted_at']
    search_fields  = ['student__username', 'task__title']
    readonly_fields = ['submitted_at']
    ordering       = ['-submitted_at']

    def score_display(self, obj):
        if obj.score is None:
            return '—'
        color = '#16a34a' if obj.score >= 8 else '#d97706' if obj.score >= 5 else '#dc2626'
        return format_html('<span style="color:{};font-weight:600">{}/10</span>', color, obj.score)
    score_display.short_description = 'Score'