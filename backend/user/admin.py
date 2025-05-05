from django.contrib import admin
from .models import User, Role, UserRole

class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']

class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1

class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'is_verify', 'date_joined']
    search_fields = ['email', 'name']
    inlines = [UserRoleInline]

admin.site.register(User, UserAdmin)
admin.site.register(Role, RoleAdmin)
