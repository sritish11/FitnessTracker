from django.urls import path
from . import views

urlpatterns = [
    path('emotions/', views.emotion_list, name='emotion_list'),
    path('emotions/create/', views.emotion_create, name='emotion_create'),
    path('adaptiveworkouts/', views.adaptive_workout_list, name='adaptive_workout_list'),
    path('adaptiveworkouts/create/', views.adaptive_workout_create, name='adaptive_workout_create'),
    path('emotions/delete/<int:emotion_id>/', views.emotion_delete, name='emotion_delete'),

]
