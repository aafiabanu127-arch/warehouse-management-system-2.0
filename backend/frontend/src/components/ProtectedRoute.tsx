import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

const ROLE_LEVEL: Record<UserRole | string, number> = {
  ADMIN:      6,
  MANAGER:    5,
  SUPERVISOR: 4,
  STAFF:      3,
  PICKER:     2,
  AUDITOR:    1,
  VIEWER:     0,
};

interface ProtectedRouteProps {
  children: ReactNode;
  minLevel?: number;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  minLevel = 0,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userLevel = ROLE_LEVEL[user.role] ?? 0;
  const hasAccess = allowedRoles
    ? allowedRoles.includes(user.role as UserRole)
    : userLevel >= minLevel;

  if (!hasAccess) {
    return <Navigate to="/dashboard" state={{ accessDenied: true }} replace />;
  }

  return <>{children}</>;
}
