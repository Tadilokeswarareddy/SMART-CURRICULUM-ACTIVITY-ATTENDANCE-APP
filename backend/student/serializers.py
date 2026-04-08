from rest_framework import serializers
from student.models import StudentModel,TaskSubmission
from api.models import UserModel


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class StudentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=UserModel.objects.filter(role='student'),
        required=False
    )
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = StudentModel
        fields = [
            'id', 'user', 'full_name', 'email',
            'roll_number', 'phone_number',
            'section', 'profile_picture'
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email


class StudentAttendanceSummarySerializer(serializers.Serializer):
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()
    teacher_name = serializers.CharField()
    present_classes = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()

class TaskSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSubmission
        fields = ['id', 'task', 'score', 'submitted_at']
