from django.db import models
from django.contrib.auth import get_user_model

# User = get_user_model()
from django.conf import settings
User = settings.AUTH_USER_MODEL
class EmotionLog(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('calm', 'Calm'),
        ('tired', 'Tired'),
        ('stressed', 'Stressed'),
        ('sad', 'Sad'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotions')
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    energy_level = models.PositiveIntegerField(default=5, help_text="Scale 1-10")
    stress_level = models.PositiveIntegerField(default=5, help_text="Scale 1-10")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.mood} ({self.timestamp.date()})"

class AdaptiveWorkout(models.Model):
    INTENSITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='adaptive_workouts')
    activity_type = models.CharField(max_length=100)
    intensity = models.CharField(max_length=20, choices=INTENSITY_CHOICES, default='medium')
    suggestion_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.activity_type} ({self.intensity}) for {self.user.username}"
