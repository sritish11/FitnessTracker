from django.urls import path
from . import views

urlpatterns = [
    path("posts/", views.fetch_posts),
    path("posts/create/", views.create_post),
    path("posts/<int:post_id>/like/", views.toggle_like),
    path("posts/<int:post_id>/comment/", views.add_comment),
    path("chats/", views.chat_list),
    path("chats/<int:friend_id>/", views.chat_messages),
    path("chats/<int:friend_id>/send/", views.send_message),
    path("chats/<int:friend_id>/clear/", views.clear_chats_with_friend, name="clear_chats_with_friend"),
    path('csrf/', views.get_csrf_token),
    path('current-user/', views.current_user, name='current_user'),
    path('communities/create/', views.create_community, name='create_community'),         # POST
    path('communities/list/', views.list_communities, name='list_communities'),           # GET
    path('communities/<int:community_id>/join/', views.join_community, name='join_community'),  # GET
    path('report/', views.report_user, name='report_user'), 
]
