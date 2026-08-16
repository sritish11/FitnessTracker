from django.db import models
from django.contrib.auth import get_user_model

from django.conf import settings
User = settings.AUTH_USER_MODEL
class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=100)
    target_frequency = models.PositiveIntegerField(default=5, help_text="Times per week")
    streak_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class HabitLog(models.Model):
    STATUS_CHOICES = [
        ('done', 'Done'),
        ('missed', 'Missed'),
    ]
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='done')

    def __str__(self):
        return f"{self.habit.title} - {self.status} ({self.date})"
