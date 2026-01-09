from rest_framework import serializers
from student.models import StudentModel
from api.models import UserModel


class StudentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class StudentSerializer(serializers.ModelSerializer):
    user = StudentModelSerializer(read_only=True)

    class Meta:
        model = StudentModel
        fields = ['id', 'user', 'roll_number', 'phone_number']
 