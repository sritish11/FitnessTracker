from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# # Register the User model with the customized admin
# admin.site.register(User, BaseUserAdmin)
from .models import ChatbotQA
admin.site.register(ChatbotQA)

from .models import UnknownQuestion
admin.site.register(UnknownQuestion)

from .models import(ChatbotFeedback)
admin.site.register(ChatbotFeedback)

from .models import(FoodPrediction)
admin.site.register(FoodPrediction)

from .models import(Friendship)
admin.site.register(Friendship)