from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "text"]

class PostSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    likes = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    content = serializers.CharField(source="caption")  # map 'caption' to 'content'

    class Meta:
        model = Post
        fields = ["id", "user", "content", "image", "created_at", "likes", "comments"]

    def get_likes(self, obj):
        return obj.like_set.count()

    def get_comments(self, obj):
        return CommentSerializer(obj.comment_set.all(), many=True).data
