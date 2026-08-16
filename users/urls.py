from django.urls import path

from tracker import views
from .views import *

urlpatterns = [
    path('profile/', profile, name='profile'),
    path('profile/<str:username>/', public_profile_view, name='public_profile'),  # react 
    path('explore/', explore_view, name='explore'),
    # path('add-friend/<str:username>/', add_friend_view, name='add_friend'),
    path("friend-requests/", views.friend_requests, name="friend_requests"),
    path('', custom_login_view, name='login'),
    # path('custom-login/', custom_login_view, name='login'),  # Add this line
    path('register', register, name='register'),
    path('logout/', logout_view, name='logout'),
    path('survey/', survey, name='survey'),
    path('list/' , index , name="index"),
    path('product/' , get_product , name="product"),
    path('product/<slug:slug>/', product_view, name='product'),
    path('<slug>/' , get_product , name="get_product"),
]
