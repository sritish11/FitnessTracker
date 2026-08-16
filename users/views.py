from django.http import HttpResponseNotFound, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

from tracker.models import FriendRequest
from .forms import UserForm, UserProfileForm, UserRegisterForm
from .models import Product, UserProfile
# from .forms import SurveyForm

# views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import UserProfile
import json
from django.contrib.auth.models import User

@login_required
def profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        print("POST Data:", request.POST)  # DEBUG
        
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']

        workouts_raw = request.POST.getlist('workout_name[]')
        values_raw = request.POST.getlist('workout_value[]')
        best_move  = request.POST.get('best_workout', 'BEST')
        
        workouts = [{"name": n, "value": v} for n, v in zip(workouts_raw, values_raw ) if n or v ]
        profile.workouts = workouts
        print("Final Workouts:", workouts)  # DEBUG
        profile.signature_move = best_move
        print("Received best_workout:", request.POST.get('best_workout'))

        profile.save()
        return redirect('profile')

    return render(request, 'users/profile.html', {'profile': profile})

@login_required
def explore_view(request):
    """
    Dashboard 'Explore' section – type username to search for users.
    Displays Add Friend / View Profile buttons dynamically.
    """
    context = {}
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        try:
            found_user = User.objects.get(username=username)
            if found_user == request.user:
                context["error"] = "You can't add yourself."
            else:
                context["found_user"] = found_user
        except User.DoesNotExist:
            context["not_found"] = True

    return render(request, "users/explore.html", context)



@login_required
def public_profile_view(request, username):
    profile = get_object_or_404(UserProfile, user__username=username)
    if request.GET.get("ajax") == "1":
        # Render only the profile card HTML (for modal)
        return render(request, 'users/public_profile_card.html', {'profile': profile})
    return render(request, 'users/public_profile.html', {'profile': profile}) # for react frontend



def custom_login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'users/login.html')


def register(request):
    """
    View for user registration.
    """
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! Please log in.')
            return redirect('login')  # Redirect to login page after successful registration
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')



from django.shortcuts import render
from .models import DietPlan
from django.contrib.auth.decorators import login_required
import requests
import random

import os
from dotenv import load_dotenv
load_dotenv()

# @login_required
def get_random_image_urls(food_names, source="pexels"):
    image_urls = []
    for food_name in food_names:
        if source == "pexels":
            url = f"https://api.pexels.com/v1/search?query={food_name}&per_page=5"
            headers = {"Authorization": os.getenv('PEXELS_API_KEY')}
        else:
            pass

        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if source == "pexels":
                image_urls.extend([photo["src"]["medium"] for photo in data.get("photos", [])])
            else:
                image_urls.append(data["urls"]["regular"])
    
    return random.sample(image_urls, min(len(image_urls), 6))  # Return up to 6 random images

@login_required
def survey(request):
    if request.method == "POST":
        age = int(request.POST.get("age"))
        height = int(request.POST.get("height"))
        weight = int(request.POST.get("weight"))
        goal = request.POST.get("goal")
        activity_level = request.POST.get("activity_level", "moderate")

        # Store data in session
        request.session["age"] = age
        request.session["height"] = height
        request.session["weight"] = weight
        request.session["goal"] = goal
        request.session["activity_level"] = activity_level

        # ✅ Calculate BMR (Basal Metabolic Rate)
        bmr = 10 * weight + 6.25 * height - 5 * age + 5  # For males (use -161 for females)

        # ✅ Adjust BMR based on activity level
        activity_multipliers = {"low": 1.2, "moderate": 1.55, "high": 1.9}
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)  # Default to "moderate"

        # ✅ Modify calories based on goal
        if goal == "muscle_gain":
            calories = tdee + 300  # Add 300 kcal for muscle gain
        elif goal == "weight_loss":
            calories = tdee - 500  # Subtract 500 kcal for weight loss
        else:
            calories = tdee  # Maintenance calories

        # ✅ Find the best diet plan based on user input
        diet_plan = DietPlan.objects.filter(
            min_age__lte=age, max_age__gt=age,
            min_height__lte=height, max_height__gte=height,
            min_weight__lte=weight, max_weight__gte=weight,
            goal=goal,
        ).first()

        # ✅ Fetch random images based on diet plan
        food_images = []
        if diet_plan and diet_plan.diet_plan:
            food_names = diet_plan.diet_plan.split(",")  # Assuming diet_plan is a comma-separated list of foods
            food_images = get_random_image_urls(food_names)

        return render(request, "users/diet_plan.html", {
            "diet_plan": diet_plan,
            "age": age,
            "height": height,
            "weight": weight,
            "goal": goal,
            "activity_level": activity_level,
            "calories": round(calories),
            "food_images": food_images,  # Pass dynamic images to the template
        })

    return render(request, "users/survey.html")


@login_required
def index(request):
    context = {'products': Product.objects.all()}
    return render(request , 'users/index.html', context)

@login_required
def get_product(request, slug):
    try:
        product = Product.objects.get(slug=slug)
        context = {'product': product}
        return render(request, 'users/product.html', context=context)
    except Product.DoesNotExist:
        return HttpResponseNotFound("Product not found.")
    except Exception as e:
        print(e)
        return HttpResponseNotFound("An unexpected error occurred.")

@login_required
def product_view(request, slug):
    product = Product.objects.get(slug=slug)
    return render(request, 'users/product.html', {'product': product})

