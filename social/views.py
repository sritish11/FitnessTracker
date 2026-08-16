from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Post, Like, Comment, Message
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
import json
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

User = get_user_model()

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})

# ---------- Posts ----------

from django.http import JsonResponse
from .models import Post
from .serializers import PostSerializer

@login_required
def fetch_posts(request):
    posts = Post.objects.all().order_by("-created_at")
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@login_required
def create_post(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        image = request.FILES.get('image')
        
        if not content:
            return JsonResponse({'error': 'Content is required'}, status=400)
            
        post = Post.objects.create(
            user=request.user,
            content=content,
            image=image
        )
        
        return JsonResponse({
            'id': post.id,
            'content': post.content,
            'image': post.image.url if post.image else None,
            'created_at': post.created_at
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# ...rest of your views...

def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    like, created = Like.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        return JsonResponse({"liked": False, "likes": post.like_set.count()})
    return JsonResponse({"liked": True, "likes": post.like_set.count()})

def add_comment(request, post_id):
    if request.method == "POST":
        body = json.loads(request.body)
        text = body.get("text")
        post = get_object_or_404(Post, id=post_id)
        comment = Comment.objects.create(user=request.user, post=post, text=text)
        return JsonResponse({"id": comment.id, "user": comment.user.username, "text": comment.text})
        
# ---------- Chat ----------
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from .models import Friendship

User = get_user_model()

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .models import Friendship

User = get_user_model()

@login_required
@require_http_methods(["GET"])
def chat_list(request):
    # Get all friendships where the current user is involved
    friendships = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)

    # Build response with friendship_id and friend info
    data = []
    for f in friendships:
        other_user = f.user2 if f.user1 == request.user else f.user1
        data.append({
            "id": other_user.id,
            "username": other_user.username,
            "friendship_id": f.id  # ✅ Include this for deletion or chat actions
        })

    return JsonResponse(data, safe=False)

@login_required
@require_http_methods(["GET"])
def chat_messages(request, friend_id):
    friend = get_object_or_404(User, id=friend_id)
    messages = Message.objects.filter(
        sender__in=[request.user, friend],
        receiver__in=[request.user, friend]
    ).order_by("timestamp")
    data = [{"id": m.id, "sender": m.sender.username, "receiver": m.receiver.username, "content": m.content} for m in messages]
    return JsonResponse(data, safe=False)

@login_required
@require_http_methods(["POST"])
def send_message(request, friend_id):
    if request.method == "POST":
        body = json.loads(request.body)
        content = body.get("content")
        friend = get_object_or_404(User, id=friend_id)
        msg = Message.objects.create(sender=request.user, receiver=friend, content=content)
        return JsonResponse({"id": msg.id, "sender": msg.sender.username, "receiver": msg.receiver.username, "content": msg.content})


@login_required
@require_http_methods(["POST"])
def clear_chats_with_friend(request, friend_id):
    # Delete messages sent by the user to the friend
    Message.objects.filter(sender=request.user, receiver_id=friend_id).delete()

    # Delete messages sent by the friend to the user
    Message.objects.filter(sender_id=friend_id, receiver=request.user).delete()

    return JsonResponse({"detail": "Chats deleted"})
    
@login_required
@require_http_methods(["GET"])
def current_user(request):
    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email
    })

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Community, Membership, Report
from django.contrib.auth.models import User

@login_required
@require_http_methods(["POST"])
def create_community(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        community = Community.objects.create(
            name=data['name'],
            description=data['description'],
            creator=request.user
        )
        Membership.objects.create(user=request.user, community=community)
        return JsonResponse({'id': community.id, 'name': community.name})

@login_required
@require_http_methods(["GET"])
def list_communities(request):
    communities = Community.objects.all().values('id', 'name', 'description')
    return JsonResponse(list(communities), safe=False)

@login_required
@require_http_methods(["GET"])
def join_community(request, community_id):
    community = Community.objects.get(id=community_id)
    Membership.objects.get_or_create(user=request.user, community=community)
    return JsonResponse({'status': 'joined'})


from django.db import IntegrityError
from .models import Report

@login_required
@require_http_methods(["GET"])
def report_user(request):
    reported_user_id = request.GET.get('reported_user_id')
    reason = request.GET.get('reason')
    category = request.GET.get('category', 'other')  # default to 'other'

    if not reported_user_id or not reason:
        return JsonResponse({'error': 'Missing required fields.'}, status=400)

    try:
        reported = User.objects.get(id=reported_user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Reported user not found.'}, status=404)

    try:
        Report.objects.create(
            reporter=request.user,
            reported_user=reported,
            reason=reason,
            category=category
        )
    except IntegrityError:
        return JsonResponse({'error': 'You have already reported this user.'}, status=409)

    count = Report.objects.filter(reported_user=reported).count()
    if count >= 5 and reported.is_active:
        reported.is_active = False
        reported.save()

    return JsonResponse({'status': 'reported', 'total_reports': count})

