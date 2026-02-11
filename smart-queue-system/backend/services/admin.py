from django.contrib import admin
from .models import Service, Counter

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Counter)
class CounterAdmin(admin.ModelAdmin):
    list_display = ('name', 'service', 'is_active')
    list_filter = ('is_active', 'service')
    search_fields = ('name',)
