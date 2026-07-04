from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Allows access only to users with the ADMIN role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class IsAdminOrManager(BasePermission):
    """
    Anyone authenticated can read (GET/HEAD/OPTIONS).
    Only Admins and Managers can create, update, or delete.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('ADMIN', 'MANAGER')


class IsAdminManagerOrSupervisor(BasePermission):
    """
    Anyone authenticated can read.
    Admin, Manager, and Warehouse Supervisor can create, update, delete,
    and approve/reject operational requests (e.g. stock transfers).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('ADMIN', 'MANAGER', 'SUPERVISOR')


class IsAdminManagerOrStaff(BasePermission):
    """
    Anyone authenticated can read.
    Admin, Manager, Supervisor, and Staff can create, update, or delete.
    Picker/Operator, Auditor, and Viewer remain read-only.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ('ADMIN', 'MANAGER', 'SUPERVISOR', 'STAFF')


class IsWarehouseFloorStaff(BasePermission):
    """
    Anyone authenticated can read.
    Admin, Manager, Supervisor, Staff, and Picker/Operator can create or
    update floor-level records (stock movements, transfer requests).
    Deletion is restricted to Admin, Manager, and Supervisor.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.method == 'DELETE':
            return request.user.role in ('ADMIN', 'MANAGER', 'SUPERVISOR')
        return request.user.role in ('ADMIN', 'MANAGER', 'SUPERVISOR', 'STAFF', 'PICKER')