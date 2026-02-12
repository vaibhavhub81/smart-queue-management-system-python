from rest_framework.permissions import BasePermission

class IsStaffOrAdmin(BasePermission):
    """
    Allows access only to staff or admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'staff' or request.user.role == 'admin'))

class IsStaffUser(BasePermission):
    """
    Allows access only to non-admin staff users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'staff')

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')
