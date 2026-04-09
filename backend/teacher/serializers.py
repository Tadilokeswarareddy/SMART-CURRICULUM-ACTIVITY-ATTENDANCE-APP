from rest_framework import serializers
from .models import TeacherModel
from api.models import UserModel


class TeacherModelSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=UserModel.objects.filter(role='teacher'),
        source='user',
        required=False
    )

    class Meta:
        model = TeacherModel
        fields = [
            'id', 'user_id',
            'full_name', 'email', 'username',
            'phone_number', 'employee_id',
            'designation', 'department',
            'qualification', 'experience_years',
            'profile_picture', 'bio',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_username(self, obj):
        return obj.user.username