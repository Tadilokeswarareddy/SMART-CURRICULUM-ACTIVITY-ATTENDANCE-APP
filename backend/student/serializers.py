from rest_framework import serializers
from student.models import StudentModel
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

    class Meta:
        model = StudentModel
        fields = ['id', 'user', 'roll_number', 'phone_number']


 
class StudentAttendanceSummarySerializer(serializers.Serializer):
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()
    teacher_name = serializers.CharField()
    present_classes = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()