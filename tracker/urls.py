from django.urls import path

# from tracker import views
from .views import *
from social import views



urlpatterns = [
    path('dashboard/', dashboard, name='dashboard'),
    path('add-activity/', add_activity, name='add_activity'),
    path('add-meal/', add_meal, name='add_meal'),
    path("delete-activity/<int:activity_id>/", delete_activity, name="delete_activity"),
    path("delete-meal/<int:meal_id>/", delete_meal, name="delete_meal"),
    path("delete-friend/<int:friend_id>/", delete_friend, name="delete_friend"),
    path("chats/", views.chat_list),
    # path('',)
    path("chat/", chatbot_view, name="chat"),
    path("feedback/", chatbot_feedback, name="chatbot_feedback"),
   
    path("friend-requests/", friend_requests, name="friend_requests"),
    path("food-camera/", food_camera, name="food_camera"),
    path("get_attendance/", get_attendance, name="get_attendance"),
    path('api/companion/tasks/', get_user_tasks, name='get_user_tasks'),
    path('api/companion/complete/', complete_task, name='complete_task'),
    path('api/companion/rewards/', get_user_rewards, name='get_user_rewards'),


]



