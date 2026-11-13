import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, OrgRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedOrgRoles?: OrgRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  allowedOrgRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin has universal access
  if (user.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Role verification
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the role's appropriate home
    if (user.role === 'CANDIDATE') return <Navigate to="/candidate" replace />;
    if (user.role === 'RECRUITER' || user.role === 'HIRING_MANAGER') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/" replace />;
  }

  // Organization role verification
  if (allowedOrgRoles && user.organizationRole && !allowedOrgRoles.includes(user.organizationRole)) {
    return <Navigate to="/recruiter" replace />;
  }

  return <>{children}</>;
};

