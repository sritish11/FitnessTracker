from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from .models import EmotionLog, AdaptiveWorkout
import json

# ✅ GET all emotion logs for user
@login_required
@require_http_methods(["GET"])
def emotion_list(request):
    logs = EmotionLog.objects.filter(user=request.user).order_by('-timestamp')
    data = [model_to_dict(e, fields=['id', 'mood', 'energy_level', 'stress_level', 'timestamp']) for e in logs]
    return JsonResponse(data, safe=False)

# ✅ POST new emotion entry
@login_required
@require_http_methods(["POST"])
def emotion_create(request):
    body = json.loads(request.body)
    mood = body.get('mood')
    energy_level = body.get('energy_level', 5)
    stress_level = body.get('stress_level', 5)

    if not mood:
        return JsonResponse({'error': 'Mood required'}, status=400)

    emotion = EmotionLog.objects.create(
        user=request.user,
        mood=mood,
        energy_level=energy_level,
        stress_level=stress_level
    )

    return JsonResponse(model_to_dict(emotion, fields=['id', 'mood', 'energy_level', 'stress_level', 'timestamp']), status=201)

# ✅ GET adaptive workout suggestions
@login_required
@require_http_methods(["GET"])
def adaptive_workout_list(request):
    workouts = AdaptiveWorkout.objects.filter(user=request.user).order_by('-created_at')
    data = [model_to_dict(w, fields=['id', 'activity_type', 'intensity', 'suggestion_text', 'created_at']) for w in workouts]
    return JsonResponse(data, safe=False)

# ✅ POST (AI-generated) adaptive workout
@login_required
@require_http_methods(["POST"])
def adaptive_workout_create(request):
    body = json.loads(request.body)
    activity_type = body.get('activity_type', 'walk')
    intensity = body.get('intensity', 'medium')
    suggestion_text = body.get('suggestion_text', 'Take a light walk today to recover.')

    workout = AdaptiveWorkout.objects.create(
        user=request.user,
        activity_type=activity_type,
        intensity=intensity,
        suggestion_text=suggestion_text
    )

    return JsonResponse(model_to_dict(workout, fields=['id', 'activity_type', 'intensity', 'suggestion_text', 'created_at']), status=201)
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model


User = get_user_model()

@require_http_methods(["POST","DELETE"])
@login_required
def emotion_delete(request, emotion_id):
    print("Deleting emotion_id:", emotion_id, "for user:", request.user.id)
    try:
        emotion = EmotionLog.objects.get(id=emotion_id, user=request.user)
        emotion.delete()
        print("Deleted successfully")
        return JsonResponse({"success": True})
    except EmotionLog.DoesNotExist:
        print("Emotion not found!")
        return JsonResponse({"error": "Not found"}, status=404)
    



