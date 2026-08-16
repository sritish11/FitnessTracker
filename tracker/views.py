from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from users.models import DietPlan,User
from .forms import ActivityForm, MealForm
from .models import Activity, Meal
from django.db.models import Sum
from users.views import get_random_image_urls
from django.db.models import Sum
from django.utils.timezone import now
from .models import Attendance
import json
from django.utils.safestring import mark_safe
import calendar
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})

from tracker import models
@login_required
def dashboard(request):
    user = request.user  # Ensure user is authenticated
    # ✅ Get session data
    age = request.session.get("age", 25)
    height = request.session.get("height", 170)
    weight = request.session.get("weight", 70)
    goal = request.session.get("goal", "general")
    activity_level = request.session.get("activity_level", "moderate")
    # ✅ Calculate BMR
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
    activity_multipliers = {"low": 1.2, "moderate": 1.55, "high": 1.9}
    tdee = bmr * activity_multipliers.get(activity_level, 1.55)
    # ✅ Modify calories based on goal
    if goal == "muscle_gain":
        calories = tdee + 300
    elif goal == "weight_loss":
        calories = tdee - 500
    else:
        calories = tdee  # Maintenance
    # ✅ Fetch Diet Plan
    diet_plan = DietPlan.objects.filter(
        min_age__lte=age, max_age__gt=age,
        min_height__lte=height, max_height__gte=height,
        min_weight__lte=weight, max_weight__gte=weight,
        goal=goal,
    ).first()
    food_images = []
    if diet_plan and diet_plan.diet_plan:
        food_names = diet_plan.diet_plan.split(",")  # Assuming diet_plan is a comma-separated list of foods
        food_images = get_random_image_urls(food_names)
    # ✅ Fetch User Activities
    activities = Activity.objects.filter(user=user).order_by('-id')
    meals = Meal.objects.filter(user=user).order_by('-id')
    Activity.objects.filter(user=request.user, created_at__lt=timezone.now() - timedelta(hours=24)).delete()
    Meal.objects.filter(user=request.user, created_at__lt=timezone.now() - timedelta(hours=24)).delete()
    # ✅ Calculate total calories burned
    total_calories_burned = Activity.objects.filter(user=request.user).aggregate(Sum('calories_burned'))['calories_burned__sum'] or 0
    # calculate total calorie intake
    total_calories_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('calories_consumed'))['calories_consumed__sum'] or 0
    remaining_calories = round(calories - total_calories_burned+total_calories_consumed)
    total_calorie = round(total_calories_consumed - total_calories_burned)
    total_calories_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('calories_consumed'))['calories_consumed__sum']or 0
    total_proteins_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('proteins_consumed'))['proteins_consumed__sum']or 0
    total_fibres_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('fibres_consumed'))['fibres_consumed__sum']or 0
    total_carbs_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('carbs_consumed'))['carbs_consumed__sum']or 0

    # Fun with Friends
    # Leaderboard logic (reuse the function we wrote earlier)
    friends = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)    
    friend_ids = set()
    friendship_map = {} 
    for f in friends:
        other_id = f.user1_id if f.user1_id != request.user.id else f.user2_id
        friend_ids.add(other_id)
        friendship_map[other_id] = f.id
    ids = list(friend_ids.union({request.user.id}))
    # 2) Aggregate totals for all relevant users in a single DB query
    totals_qs = (Meal.objects.filter(user_id__in=ids).values('user_id').annotate(total_calories=Sum('calories_consumed'), total_proteins=Sum('proteins_consumed')))
    # 3) Map user_id -> aggregated totals
    totals_map = {t['user_id']: t for t in totals_qs}
    # 4) Build leaderboard data: create a fresh dict per user (no reuse)
    users = User.objects.filter(id__in=ids)
    data = []
    for u in users:
        t = totals_map.get(u.id, {})
        total_cal = t.get('total_calories') or 0
        total_prot = t.get('total_proteins') or 0
        score = total_cal + total_prot
        data.append({
            'user_id': u.id,
            'username': u.username,
            'calories': int(total_cal),
            'protein': float(total_prot),
            'score': score,
            'friendship_id': friendship_map.get(u.id),
        })
    # 5) Sort leaderboard
    leaderboard_sorted = sorted(data, key=lambda x: x['score'], reverse=True)
    # 6) Logged-in user totals (explicitly calculated)
    my_totals = totals_map.get(request.user.id, {})
    # my_calories = my_totals.get('total_calories') or 0
    # my_proteins = my_totals.get('total_proteins') or 0
    # Optional: streak & badge for current user
    streak_days = Activity.objects.filter(user=request.user).count()
    badge = "Consistency Badge" if streak_days >= 5 else "Keep Going"

# Workout
    workout_variations = {
        "Chest Day": [
            {"name": "Dumbbell Bench Press", "sets": "4 sets x 12 reps"},
            {"name": "Incline Bench Press", "sets": "3 sets x 10 reps"},
            {"name": "Push-Ups", "sets": "3 sets x 20 reps"},
        ],
        "Back Day": [
            {"name": "Pull-Ups", "sets": "3 sets x 10 reps"},
            {"name": "Deadlift", "sets": "4 sets x 8 reps"},
            {"name": "Seated Row", "sets": "3 sets x 12 reps"},
        ],
        "Leg Day": [
            {"name": "Squats", "sets": "4 sets x 12 reps"},
            {"name": "Lunges", "sets": "3 sets x 12 reps"},
            {"name": "Leg Press", "sets": "4 sets x 10 reps"},
        ],
        "Arms & Shoulders": [
            {"name": "Bicep Curls", "sets": "3 sets x 15 reps"},
            {"name": "Tricep Dips", "sets": "3 sets x 12 reps"},
            {"name": "Shoulder Press", "sets": "4 sets x 10 reps"},
        ],
        "Core/Abs": [
            {"name": "Crunches", "sets": "3 sets x 20 reps"},
            {"name": "Plank", "sets": "3 x 60 sec"},
            {"name": "Leg Raises", "sets": "3 sets x 15 reps"},
        ],
    }

# For task with companion


    return render(request, "tracker/dashboard.html", {
        "diet_plan": diet_plan,
        "food_images": food_images,
        "calories": round(calories),
        "age": age,
        "height": height,
        "weight": weight,
        "goal": goal,
        "activities": activities,
        "meals": meals,
        "total_calories_burned": total_calories_burned , # Passing total burned calories
        "total_calories_consumed": total_calories_consumed,
        "remaining_calories": remaining_calories,
        "total_calorie": total_calorie,
        "total_proteins_consumed" : total_proteins_consumed,
        "total_fibres_consumed" : total_fibres_consumed,
        "total_carbs_consumed" :total_carbs_consumed,
        # "picture": picture,
        'leaderboard': leaderboard_sorted,
        # 'my_calories': int(my_calories),
        # 'my_proteins': float(my_proteins),
        'streak_days': streak_days,
        'badge': badge,
        "workout_variations": workout_variations.items(),
        "workout_variations_json": mark_safe(json.dumps(workout_variations)),
        # "attendance_data": attendance_data,
        # "month_days": list(range(1, month_days + 1)),
    })
# views.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import CompanionTask, UserTaskCompletion, UserRewards
import json

@login_required
@require_http_methods(["GET"])
def get_user_tasks(request):
    """Get next 3 tasks for the user"""
    user = request.user
    
    # Get completed task IDs
    completed_task_ids = UserTaskCompletion.objects.filter(
        user=user
    ).values_list('task_id', flat=True)
    
    # Get next 3 uncompleted tasks
    tasks = CompanionTask.objects.filter(
        is_active=True
    ).exclude(
        id__in=completed_task_ids
    )[:3]
    
    # Get or create user rewards
    user_rewards, created = UserRewards.objects.get_or_create(user=user)
    
    tasks_data = [{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'points': task.points,
    } for task in tasks]
    
    return JsonResponse({
        'tasks': tasks_data,
        'total_points': user_rewards.total_points,
        'total_rupees': float(user_rewards.total_rupees),
        'completed_count': completed_task_ids.count()
    })


@login_required
@require_http_methods(["POST"])
def complete_task(request):
    """Mark a task as completed and award points"""
    try:
        data = json.loads(request.body)
        task_id = data.get('task_id')
        
        user = request.user
        task = CompanionTask.objects.get(id=task_id, is_active=True)
        
        # Check if already completed
        if UserTaskCompletion.objects.filter(user=user, task=task).exists():
            return JsonResponse({'error': 'Task already completed'}, status=400)
        
        # Create completion record
        completion = UserTaskCompletion.objects.create(
            user=user,
            task=task,
            points_earned=task.points
        )
        
        # Update user rewards
        user_rewards, created = UserRewards.objects.get_or_create(user=user)
        user_rewards.update_rewards(task.points)
        
        # Check if user completed all current tasks batch
        completed_task_ids = UserTaskCompletion.objects.filter(
            user=user
        ).values_list('task_id', flat=True)
        
        remaining_tasks = CompanionTask.objects.filter(
            is_active=True
        ).exclude(
            id__in=completed_task_ids
        ).count()
        
        # Get next tasks
        next_tasks = CompanionTask.objects.filter(
            is_active=True
        ).exclude(
            id__in=completed_task_ids
        )[:3]
        
        next_tasks_data = [{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'points': t.points,
        } for t in next_tasks]
        
        return JsonResponse({
            'success': True,
            'points_earned': task.points,
            'total_points': user_rewards.total_points,
            'total_rupees': float(user_rewards.total_rupees),
            'next_tasks': next_tasks_data,
            'new_batch': len(next_tasks_data) > 0 and remaining_tasks >= 3
        })
        
    except CompanionTask.DoesNotExist:
        return JsonResponse({'error': 'Task not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["GET"])
def get_user_rewards(request):
    """Get user's total rewards"""
    user = request.user
    user_rewards, created = UserRewards.objects.get_or_create(user=user)
    
    return JsonResponse({
        'total_points': user_rewards.total_points,
        'total_rupees': float(user_rewards.total_rupees)
    })



from django.http import JsonResponse
import calendar

@login_required
def get_attendance(request):
    user = request.user
    year = int(request.GET.get("year", timezone.now().year))
    month = int(request.GET.get("month", timezone.now().month))

    days_in_month = calendar.monthrange(year, month)[1]
    attendance_records = Attendance.objects.filter(
        user=user, date__year=year, date__month=month
    )

    present_days = [record.date.day for record in attendance_records]

    return JsonResponse({
        "year": year,
        "month": month,
        "days": days_in_month,
        "present_days": present_days
    })


@login_required
def add_activity(request):
    if request.method == 'POST':
        form = ActivityForm(request.POST)
        if form.is_valid():
            activity = form.save(commit=False)
            activity.user = request.user
            activity.save()
            Activity.objects.filter(user=request.user, created_at__lt=timezone.now() - timedelta(hours=24)).delete()
            # ✅ Calculate total calories burned
            total_calories_burned = Activity.objects.filter(user=request.user).aggregate(Sum('calories_burned'))['calories_burned__sum'] or 0
            # ✅ Store in session (optional)
            request.session['total_calories_burned'] = total_calories_burned
            Attendance.objects.get_or_create(user=request.user, date=now().date())         
            return redirect('dashboard')
    else:
        form = ActivityForm()    
    return render(request, 'tracker/add_activity.html', {'form': form})

from datetime import timedelta
from django.utils import timezone
from .models import Meal
@login_required
def add_meal(request):
    if request.method == 'POST':
        form = MealForm(request.POST)
        if form.is_valid():
            meal = form.save(commit=False)
            meal.user = request.user
            meal.save()
            # Delete meals older than 24 hours for the current user
            Meal.objects.filter(user=request.user, created_at__lt=timezone.now() - timedelta(hours=24)).delete()
            total_calories_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('calories_consumed'))['calories_consumed__sum']or 0
            total_proteins_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('proteins_consumed'))['proteins_consumed__sum']or 0
            total_fibres_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('fibres_consumed'))['fibres_consumed__sum']or 0
            total_carbs_consumed = Meal.objects.filter(user=request.user).aggregate(Sum('carbs_consumed'))['carbs_consumed__sum']or 0
            # store in session
            request.session['total_calories_consumed'] = total_calories_consumed
            request.session['total_proteins_consumed'] = total_proteins_consumed
            request.session['total_fibres_consumed'] = total_fibres_consumed
            request.session['total_carbs_consumed'] = total_carbs_consumed

            return redirect('dashboard')
    else:
        form = MealForm()
    return render(request, 'tracker/add_meal.html', {'form': form})
@login_required
def delete_activity(request, activity_id):
    activity = get_object_or_404(Activity, id=activity_id, user=request.user)
    if request.method == "POST":
        activity.delete()
    return redirect("dashboard")  # Redirect back to the dashboard

@login_required
def delete_meal(request, meal_id):
    meal = get_object_or_404(Meal, id=meal_id, user=request.user)
    if request.method == "POST":
        meal.delete()
    return redirect("dashboard")  # Redirect back to the dashboard
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
qa_pairs = {
    "what is a healthy breakfast?": "A healthy breakfast can include oatmeal, eggs, fruit, or yogurt.",
    "how many calories should i eat per day?": "It depends on age, gender, and activity level, but usually 1800-2500 calories.",
    "give me a workout for weight loss": "Try 30 minutes of cardio + strength training 4-5 times a week.",
    "hello": "Hi there! How can I help with your diet and fitness?",
}
from .models import ChatbotQA, UnknownQuestion
from fuzzywuzzy import fuzz
import difflib
@csrf_exempt
def chatbot_view(request):
    if request.method == "POST":
        user_input = request.POST.get("message", "").strip().lower()
        qa = ChatbotQA.objects.filter(question__iexact=user_input).first()
        if qa:
            response = qa.answer
        else:
            # Token sort ratio fuzzy matching
            all_qs = list(ChatbotQA.objects.values_list('question', flat=True))
            best_score = 0
            best_match = None
            for q in all_qs:
                score = fuzz.token_sort_ratio(user_input, q.lower())
                if score > best_score:
                    best_score = score
                    best_match = q
            if best_score >= 80:  # 80 is a good threshold for strong similarity
                qa = ChatbotQA.objects.filter(question=best_match).first()
                response = qa.answer
            else:
                # ... (rest of your unknown/fallback logic)
                # Fuzzy match in UnknownQuestion
                all_unknown_qs = list(UnknownQuestion.objects.values_list('question', flat=True))
                close_unknown = difflib.get_close_matches(user_input, all_unknown_qs, n=1, cutoff=0.6)
                if close_unknown:
                    unknown = UnknownQuestion.objects.filter(question=close_unknown[0]).first()
                    if unknown and unknown.answer:
                        response = unknown.answer
                    else:
                        response = qa_pairs.get(
                            user_input,
                            "Sorry, I don't know that yet. Try asking another fitness or diet question."
                        )
                        if response.startswith("Sorry"):
                            UnknownQuestion.objects.get_or_create(question=user_input)
                else:
                    response = qa_pairs.get(
                        user_input,
                        "Sorry, I don't know that yet. Try asking another fitness or diet question."
                    )
                    if response.startswith("Sorry"):
                        UnknownQuestion.objects.get_or_create(question=user_input)
        return JsonResponse({"response": response})
    return render(request, "tracker/chat.html")

from .models import ChatbotFeedback
@csrf_exempt
def chatbot_feedback(request):
    if request.method == "POST":
        question = request.POST.get("question", "")
        answer = request.POST.get("answer", "")
        helpful = request.POST.get("helpful", "") == "true"
        ChatbotFeedback.objects.create(question=question, answer=answer, helpful=helpful)
        return JsonResponse({"status": "ok"})
    
# Friend activities and leaderbord
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from .models import FriendRequest, Friendship
from django.contrib import messages


User = get_user_model()

@login_required
@require_http_methods(["GET", "POST"])
def friend_requests(request):
    pending_requests = FriendRequest.objects.filter(to_user=request.user, accepted=False)
    outgoing_requests = FriendRequest.objects.filter(from_user=request.user, accepted=False)

    if request.method == "POST":
        action = request.POST.get("action")
        fr_id = request.POST.get("fr_id")
        friend_username = request.POST.get("friend_code")
        from_user = request.user

        if action and fr_id:
            fr = FriendRequest.objects.filter(id=fr_id, accepted=False).filter(
                Q(to_user=from_user) | Q(from_user=from_user)
            ).first()

            if not fr:
                return redirect("friend_requests")

            if action == "accept":
                fr.accepted = True
                fr.save()

                friendship = Friendship(user1=fr.from_user, user2=fr.to_user)
                friendship.full_clean()
                friendship.save()

            # ✅ decline or cancel — same logic
            fr.delete()
            return redirect("friend_requests")

        elif friend_username:
            try:
                to_user = User.objects.get(username=friend_username)
            except User.DoesNotExist:
                messages.error(request, "❌ Username not found.")
                return redirect("friend_requests")

            if from_user == to_user:
                return redirect("friend_requests")

            # Remove any stale requests
            FriendRequest.objects.filter(from_user=from_user, to_user=to_user).delete()
            FriendRequest.objects.filter(from_user=to_user, to_user=from_user).delete()

            # Prevent duplicate friendships
            if Friendship.objects.filter(user1=from_user, user2=to_user).exists() or \
               Friendship.objects.filter(user1=to_user, user2=from_user).exists():
                return redirect("friend_requests")

            FriendRequest.objects.create(from_user=from_user, to_user=to_user)
            return redirect("friend_requests")

    return render(request, "tracker/friend_requests.html", {
        "friend_requests": pending_requests,
        "outgoing_requests": outgoing_requests
    })

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def delete_friend(request, friend_id):
    try:
        friend = Friendship.objects.get(id=friend_id)
        if friend.user1 != request.user and friend.user2 != request.user:
            return JsonResponse({"error": "Unauthorized"}, status=403)
        friend.delete()
        # ✅ Clean up any lingering friend requests
        FriendRequest.objects.filter(from_user=friend.user1, to_user=friend.user2).delete()
        FriendRequest.objects.filter(from_user=friend.user2, to_user=friend.user1).delete()
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"detail": "Friend deleted"}, status=200)
    except Friendship.DoesNotExist:
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"error": "Friendship not found"}, status=404)
    return redirect("dashboard")


import json, os
import pandas as pd
import numpy as np
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
from tensorflow.keras.models import load_model # pyright: ignore[reportMissingImports]
from tensorflow.keras.preprocessing import image  # pyright: ignore[reportMissingImports]
from .models import FoodPrediction
import base64
from django.core.files.base import ContentFile
# Load the trained model once
MODEL_PATH = os.path.join(settings.BASE_DIR, "food_model.h5")
MODEL = load_model(MODEL_PATH)
# Load nutrition CSV once
NUTRITION_DF = pd.read_csv(os.path.join(settings.BASE_DIR, "food_nutrition.csv"))
@login_required
def food_camera(request):
    if request.method == "POST":
        uploaded_image = None
        if request.POST.get("captured_image"):
            try:
                format, imgstr = request.POST["captured_image"].split(';base64,')
                ext = format.split('/')[-1]
                uploaded_image = ContentFile(base64.b64decode(imgstr), name=f"captured_food.{ext}")
            except Exception as e:
                uploaded_image = None
        else:
            uploaded_image = request.FILES.get("food_image")
        if not uploaded_image:
            return render(request, "tracker/food_camera.html", {
                "error": "No image was uploaded. Please try again."
            })
        # Save the uploaded image manually
        save_dir = os.path.join(settings.MEDIA_ROOT, "temp")
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, uploaded_image.name)
        with open(file_path, "wb+") as f:
            for chunk in uploaded_image.chunks():
                f.write(chunk)
        # ✅ Build image URL manually (so it can be displayed in template)
        # file_url = f"{settings.MEDIA_URL}temp/{uploaded_image.name}"
        # Preprocess for CNN
        img = image.load_img(file_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        # Predict
        predictions = MODEL.predict(img_array)
        class_idx = np.argmax(predictions)
        predicted_class = list(NUTRITION_DF['food_class'])[class_idx]
        # Fetch nutrition info
        row = NUTRITION_DF[NUTRITION_DF['food_class'] == predicted_class].iloc[0]
        calories, protein, carbs, fiber = row['calories'], row['protein'], row['carbs'], row['fiber']
        # Calculate stroke offsets for circular progress (after nutrition info is available)
        max_calories = 500
        max_protein = 50
        max_carbs = 100
        max_fiber = 30
        stroke_total = 220  # circumference length of the big circle
        mini_stroke_total = 176  # circumference of smaller macro circles
        calories_offset = stroke_total - (calories / max_calories) * stroke_total
        protein_offset = mini_stroke_total - (protein / max_protein) * mini_stroke_total
        carbs_offset = mini_stroke_total - (carbs / max_carbs) * mini_stroke_total
        fiber_offset = mini_stroke_total - (fiber / max_fiber) * mini_stroke_total
        # Save in DB (this saves the image permanently if you need later retrieval)
        food_prediction = FoodPrediction.objects.create(
            user=request.user,
            image=uploaded_image,
            predicted_class=predicted_class,
            calories=calories,
            protein=protein,
            carbs=carbs,
            fiber=fiber)
        return render(request, "tracker/food_result.html", {
            "predicted_class": predicted_class,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fiber": fiber,
            "image_url": food_prediction.image.url, # ✅ Pass the correct URL
            # Pass offsets
            "calories_offset": calories_offset,
            "protein_offset": protein_offset,
            "carbs_offset": carbs_offset,
            "fiber_offset": fiber_offset,
        })
    return render(request, "tracker/food_camera.html")

