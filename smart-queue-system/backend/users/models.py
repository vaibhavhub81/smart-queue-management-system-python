from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    def save(self, *args, **kwargs):
        # Ensure that if a user is a superuser, their role is always 'admin'.
        if self.is_superuser:
            self.role = 'admin'

        # Set staff/superuser status based on the role (source of truth)
        if self.role == 'admin':
            self.is_staff = True
            self.is_superuser = True
        elif self.role == 'staff':
            self.is_staff = True
            self.is_superuser = False
        else: # 'student' or any other default
            self.is_staff = False
            self.is_superuser = False
            
        super().save(*args, **kwargs)
