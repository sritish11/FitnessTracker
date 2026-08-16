from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from .models import Habit, HabitLog
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})

# ✅ GET all habits of current user
@login_required
@require_http_methods(["GET"])
def habit_list(request):
    habits = Habit.objects.filter(user=request.user)
    data = [model_to_dict(h, fields=['id', 'title', 'target_frequency', 'streak_count', 'created_at']) for h in habits]
    return JsonResponse(data, safe=False)

# ✅ POST new habit
@login_required
@require_http_methods(["POST"])
def habit_create(request):
    import json
    body = json.loads(request.body)
    title = body.get('title')
    target_frequency = body.get('target_frequency', 5)
    
    if not title:
        return JsonResponse({'error': 'Title required'}, status=400)
    
    habit = Habit.objects.create(user=request.user, title=title, target_frequency=target_frequency)
    return JsonResponse(model_to_dict(habit, fields=['id', 'title', 'target_frequency', 'created_at']), status=201)

# ✅ GET habit logs for user
@login_required
@require_http_methods(["GET"])
def habit_log_list(request):
    logs = HabitLog.objects.filter(habit__user=request.user).select_related('habit')
    data = [{
        'id': log.id,
        'habit': log.habit.title,
        'date': log.date.strftime('%Y-%m-%d'),
        'status': log.status
    } for log in logs]
    return JsonResponse(data, safe=False)

# ✅ POST new log entry
@login_required
@require_http_methods(["POST"])
def habit_log_create(request):
    import json
    body = json.loads(request.body)
    habit_id = body.get('habit_id')
    status = body.get('status', 'done')

    try:
        habit = Habit.objects.get(id=habit_id, user=request.user)
    except Habit.DoesNotExist:
        return JsonResponse({'error': 'Habit not found'}, status=404)

    log = HabitLog.objects.create(habit=habit, status=status)
    return JsonResponse({
        'id': log.id,
        'habit': habit.title,
        'status': log.status,
        'date': log.date.strftime('%Y-%m-%d')
    }, status=201)
