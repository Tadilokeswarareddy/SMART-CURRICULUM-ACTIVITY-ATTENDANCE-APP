from rest_framework import serializers
from api.models import (
    UserModel, Branch, Year, Section, Subject,
    TeachingAssignment, TimeTable,
    AttendanceSession, Attendance
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from teacher.models import TeacherModel



class UserModelSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserModel
        fields = ['id','username', 'password', 'first_name', 'last_name', 'role', 'email']

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
        print("🔥 LOGIN DATA RECEIVED:", attrs)   # ✅ ADD THIS

        try:
            data = super().validate(attrs)
            print("✅ LOGIN SUCCESS:", attrs.get("username"))  # optional
        except Exception as e:
            print("❌ LOGIN FAILED:", attrs)  # VERY IMPORTANT
            raise e

        data['role'] = self.user.role
        return data


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name']


class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = ['id', 'year']


class SectionSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    year = YearSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(), source='branch', write_only=False
    )
    year_id = serializers.PrimaryKeyRelatedField(
        queryset=Year.objects.all(), source='year', write_only=False
    )

    class Meta:
        model = Section
        fields = ['id', 'branch', 'year', 'branch_id', 'year_id', 'name']



class SubjectSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)
    year = YearSerializer(read_only=True)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(), source='branch', write_only=False
    )
    year_id = serializers.PrimaryKeyRelatedField(
        queryset=Year.objects.all(), source='year', write_only=False
    )

    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code',
            'branch', 'year',
            'branch_id', 'year_id',
            'syllabus_pdf', 'syllabus_description'
        ]



class TeachingAssignmentSerializer(serializers.ModelSerializer):
    teacher = serializers.StringRelatedField()
    subject = SubjectSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=False
    )
    section_id = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all(), source='section', write_only=False
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
    queryset=TeacherModel.objects.all(), source='teacher', write_only=False
    )

    class Meta:
        model = TeachingAssignment
        fields = ['id', 'teacher', 'teacher_id', 'subject', 'subject_id', 'section', 'section_id']



class TimeTableSerializer(serializers.ModelSerializer):
    assignment = TeachingAssignmentSerializer(read_only=True)       
    assignment_id = serializers.PrimaryKeyRelatedField(             
        queryset=TeachingAssignment.objects.all(),
        source='assignment',
        write_only=False
    )

    class Meta:
        model = TimeTable
        fields = ['id', 'assignment', 'assignment_id', 'day', 'start_time', 'end_time']

class AttendanceSessionSerializer(serializers.ModelSerializer):
    assignment = TeachingAssignmentSerializer(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'assignment', 'date', 'start_time', 'is_active', 'qr_token']


class AttendanceSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()
    session = serializers.StringRelatedField()

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'session', 'status', 'marked_at']