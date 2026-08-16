from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)  # in kilograms
    height = models.FloatField(null=True, blank=True)  # in centimeters
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    workouts = models.JSONField(default=list, blank=True)
    signature_move = models.CharField(max_length=25, default='BEST', blank=True)
    # focus_mode = models.CharField(max_length=50, choices=[
    #     ("habit", "HabitForge"),
    #     ("emotion", "MindSync")
    # ], default="habit")
    # motivation_style = models.CharField(max_length=50, default="balanced")
    # last_mood = models.CharField(max_length=50, blank=True, default="")
    # streak_days = models.IntegerField(default=0)
    # def save(self, *args, **kwargs):
    #     # Only set default if creating a new instance and move is blank
    #     if not self.pk and not self.signature_move:
    #         self.signature_move = 'BEST'
    #     super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    @property
    def bmi(self):
        """Calculate the BMI (Body Mass Index)."""
        if self.height and self.weight:
            height_in_meters = self.height / 100
            return round(self.weight / (height_in_meters ** 2), 2)
        return None




# class SurveyQuestion(models.Model):
#     question_text = models.TextField()
#     options = models.JSONField()

#     def __str__(self):
#         return self.question_text

# class UserResponse(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
#     response = models.TextField()

#     def __str__(self):
#         return f"{self.user.name} - {self.question.question_text}"



from django.db import models

class DietPlan(models.Model):
    min_age = models.IntegerField(default=18)
    max_age = models.IntegerField(default=30)
    min_height = models.IntegerField(default=160)
    max_height = models.IntegerField(default=180)
    min_weight = models.IntegerField(default=50)
    max_weight = models.IntegerField(default=80)
    goal = models.CharField(max_length=20, default="general")
    diet_plan = models.TextField(default="")
    image_urls = models.TextField(default="")  

    def get_image_list(self):
        """Convert comma-separated image URLs into a list."""
        return self.image_urls.split(",")

    def __str__(self):
        return f"{self.goal} - {self.min_age}-{self.max_age} years - {self.diet_plan} - {self.image_urls}"
    

from django.utils.text import slugify
class Category(models.Model):
    category_name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, null=True,blank=True)
    # category_image = models.ImageField(upload_to="categories")

# For automatic slug generate
    def save(self , *args , **kwargs):
        self.slug = slugify(self.category_name)
        super(Category , self).save(*args , **kwargs)

    def __str__(self) -> str:
        return self.category_name
        
class Product(models.Model):
    product_name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, null=True,blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name= "products")
    price = models.IntegerField()
    product_description = models.TextField()
    # color_variant = models.ManyToManyField(ColorVariant , blank=True)
    # size_variant = models.ManyToManyField(SizeVariant , blank=True )

# For automatic slug generate
    def save(self , *args , **kwargs):
        if not self.slug: slugify(self.product_name)
        super(Product , self).save(*args , **kwargs)

    def __str__(self) -> str:
        return self.product_name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_image")
    image = models.ImageField(upload_to="product")


# class Coupon(BaseModel):
#     coupon_code = models.CharField(max_length=10)
#     is_expired = models.BooleanField(default=False)
#     discount_price = models.IntegerField(default=100)
#     minimun_amount = models.IntegerField(default=500)

