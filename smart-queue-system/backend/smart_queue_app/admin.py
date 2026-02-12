from django.contrib import admin
from .models import QueueEntry

@admin.register(QueueEntry)
class QueueEntryAdmin(admin.ModelAdmin):
    list_display = ('token_number', 'service', 'user', 'status', 'counter', 'created_at')
    list_filter = ('status', 'service', 'counter')
    search_fields = ('user__username', 'token_number')
    ordering = ('-created_at',)
