from django.contrib import admin
from .models import UserProfile, DietPlan

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'weight', 'height')

from .models import(DietPlan)
admin.site.register(DietPlan)

from .models import(Product)
admin.site.register(Product)

from .models import(ProductImage)
admin.site.register(ProductImage)

from .models import(Category)
admin.site.register(Category)