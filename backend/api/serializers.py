from rest_framework import serializers
from .models import UserModel
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