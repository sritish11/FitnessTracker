from django.db import models
from django.conf import settings
from django.utils import timezone
from tracker.models import Friendship  # your existing app

User = settings.AUTH_USER_MODEL


# ---------------- Messages ----------------
class Message(models.Model):
    sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Ensure only friends can chat
        if not Friendship.objects.filter(
            user1__in=[self.sender, self.receiver],
            user2__in=[self.sender, self.receiver]
        ).exists():
            raise ValueError("Users must be friends to send messages.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.content[:30]}"


# ---------------- Posts ----------------
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="posts/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def total_likes(self):
        return self.likes.count()

    def total_comments(self):
        return self.comments.count()

    def __str__(self):
        return f"{self.user.username} - {self.content[:30]}"


# ---------------- Likes ----------------
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name="likes", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")  # prevent multiple likes

    def __str__(self):
        return f"{self.user.username} ❤️ {self.post.id}"


# ---------------- Comments ----------------
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.post.id}"

# -------------------COMMUNITIES-------------

class Community(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_communities')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')

class CommunityPost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_posts')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='community_posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author.username} in {self.community.name}: {self.content[:30]}"



from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Report(models.Model):
    CATEGORY_CHOICES = [
        ('spam', 'Spam'),
        ('abuse', 'Abuse'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    ]

    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports_made'
    )
    reported_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports_received'
    )
    reason = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other'
    )
    is_reviewed = models.BooleanField(default=False)
    action_taken = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('reporter', 'reported_user')
        ordering = ['-created_at']

    def __str__(self):
        reporter_name = getattr(self.reporter, 'username', 'Unknown')
        reported_name = getattr(self.reported_user, 'username', 'Unknown')
        return f"{reporter_name} reported {reported_name} ({self.category})"


