from rest_framework import serializers
from .models import UserModel,StudentModel,TeacherModel,Course,Subject
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import ClassGroup,Enrollment,TimeTableSlot
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
    
class StudentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentModel
        fields = '__all__'

class TeacherModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherModel
        fields = '__all__'



class CourseSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class SubjectSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ClassGroupSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = ClassGroup
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeTableSlot
        fields = '__all__'
    