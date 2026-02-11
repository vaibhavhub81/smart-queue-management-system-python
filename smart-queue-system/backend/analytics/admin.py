from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'service', 'action', 'user', 'counter')
    list_filter = ('action', 'service', 'counter')
    search_fields = ('user__username', 'service__name')
    ordering = ('-timestamp',)
