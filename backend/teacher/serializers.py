from rest_framework import serializers
from .models import TeacherModel


class TeacherModelSerializer(serializers.ModelSerializer):
    # These pull from the linked UserModel so frontend gets them in one call
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = TeacherModel
        fields = [
            'id',
            'full_name',
            'email',
            'phone_number',
            'employee_id',
            'designation',
            'department',
            'qualification',
            'experience_years',
            'profile_picture',
            'bio',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_email(self, obj):
        return obj.user.email