from rest_framework import serializers
from api.models import (
    UserModel,
    Branch, Year, Section, Subject,
    TeachingAssignment, TimeTable,
    AttendanceSession, Attendance
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserModelSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = UserModel
        fields = ['username','password','first_name','last_name','role','email']

    def create(self, validated_data):
        user = UserModel.objects.create_user(**validated_data)
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        return data

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['name']

class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = ['id', 'year']

class SectionSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    year = YearSerializer(read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'branch', 'year', 'name']

class SubjectSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    year = YearSerializer(read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'branch', 'year']

class TeachingAssignmentSerializer(serializers.ModelSerializer):
    teacher = serializers.StringRelatedField()
    subject = SubjectSerializer(read_only=True)
    section = SectionSerializer(read_only=True)

    class Meta:
        model = TeachingAssignment
        fields = ['id', 'teacher', 'subject', 'section']

class TimeTableSerializer(serializers.ModelSerializer):
    assignment = TeachingAssignmentSerializer(read_only=True)

    class Meta:
        model = TimeTable
        fields = ['id', 'assignment', 'day', 'start_time', 'end_time']

class AttendanceSessionSerializer(serializers.ModelSerializer):
    assignment = TeachingAssignmentSerializer(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'assignment', 'date',
            'start_time', 'is_active', 'qr_token'
        ]

class AttendanceSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()
    session = serializers.StringRelatedField()

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'session', 'status', 'marked_at']

