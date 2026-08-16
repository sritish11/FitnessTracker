from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50)
    duration = models.DurationField()
    calories_burned = models.FloatField(default=0.0)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Create/update attendance
        Attendance.objects.get_or_create(user=self.user, date=self.date)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} ({self.date})"


class Meal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meal_name = models.CharField(max_length=100)
    calories_consumed = models.FloatField(default=0.0)  # Removed max_length
    proteins_consumed = models.FloatField(default=0.0)  # Fixed spelling
    fibres_consumed = models.FloatField(default=0.0)
    carbs_consumed = models.FloatField(default=0.0)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.meal_name} ({self.date})"

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    target_weight = models.FloatField(default=0.0)
    weekly_exercise_hours = models.FloatField(default=0.0)
    start_date = models.DateField(auto_now_add=True, editable=False)  # Prevent editing
    end_date = models.DateField(null=True, blank=True)


    def __str__(self):
        return f"{self.user.username}'s Goal - {self.target_weight}kg by {self.end_date}"

from django.db import models

class DietPlan(models.Model):
    min_age = models.IntegerField(default=18)
    max_age = models.IntegerField(default=30)
    min_height = models.IntegerField(default=160)
    max_height = models.IntegerField(default=180)
    min_weight = models.IntegerField(default=50)
    max_weight = models.IntegerField(default=80)
    goal = models.CharField(max_length=20, default="general")
    diet_plan = models.TextField(default="")
    image_urls = models.TextField(default="")

    

    def get_image_list(self):
        """Convert comma-separated image URLs into a list."""
        return self.image_urls.split(",")

    def __str__(self):
        return f"{self.goal} - {self.min_age}-{self.max_age} years - {self.diet_plan} - {self.image_urls}"


from django.db import models
from django.contrib.auth import get_user_model

class ChatbotQA(models.Model):
    question = models.CharField(max_length=255, unique=True)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # Optional: Track who added the Q&A
    added_by = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.question
    
from django.db import models

class UnknownQuestion(models.Model):
    question = models.CharField(max_length=255, unique=True)
    answer = models.TextField(blank=True, null=True) 
    answer1 = models.TextField(blank=True, null=True)
    answer2 = models.TextField(blank=True, null=True)   # <-- Added this line
    asked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question

class ChatbotFeedback(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    helpful = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.question} - {'Helpful' if self.helpful else 'Not Helpful'}"






# Friend Activity and leaderboard


# tracker/models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['from_user', 'to_user'], name='unique_friend_request')
        ]

    def __str__(self):
        return f"{self.from_user} ➡️ {self.to_user}"

class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name="friends1", on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name="friends2", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user1", "user2"], name="unique_friendship")
        ]

    def clean(self):
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1

    def __str__(self):
        return f"{self.user1} 🤝 {self.user2}"

    
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)

    class Meta:
        unique_together = ("user", "date")  # prevents duplicates

    def __str__(self):
        return f"{self.user.username} - {self.date}"



from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class FoodPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='food_images/')
    predicted_class = models.CharField(max_length=100)
    calories = models.FloatField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fiber = models.FloatField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.predicted_class} ({self.created_at.date()})"


# models.py
from django.db import models
from django.contrib.auth.models import User

class CompanionTask(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    points = models.IntegerField(default=10)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class UserTaskCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_completions')
    task = models.ForeignKey(CompanionTask, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    points_earned = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'task']
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.task.title}"


class UserRewards(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rewards')
    total_points = models.IntegerField(default=0)
    total_rupees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def update_rewards(self, points):
        self.total_points += points
        self.total_rupees = self.total_points / 10
        self.save()

    def __str__(self):
        return f"{self.user.username} - {self.total_points} pts"