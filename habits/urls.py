from django.urls import path
from . import views

urlpatterns = [
    path('habits/', views.habit_list, name='habit_list'),
    path('habits/create/', views.habit_create, name='habit_create'),
    path('habitlogs/', views.habit_log_list, name='habit_log_list'),
    path('habitlogs/create/', views.habit_log_create, name='habit_log_create'),
    path('csrf/', views.get_csrf_token),
]
