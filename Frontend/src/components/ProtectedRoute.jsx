import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isRouteAllowed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPermissions = user.permissions || [];
  const hasAdminPermission = user.role === 'ADMIN' || userPermissions.some(p => p.menuUrl && p.menuUrl.startsWith('/admin'));

  if (allowedRoles) {
    const hasRoleAccess = allowedRoles.some(r =>
      (r === 'ADMIN' && hasAdminPermission) ||
      (r === 'MEMBER' && !hasAdminPermission)
    );

    if (!hasRoleAccess) {
      return <Navigate to={hasAdminPermission ? '/admin' : '/member'} replace />;
    }
  }

  // Route screen check
  if (!isRouteAllowed(location.pathname)) {
    return <Navigate to={hasAdminPermission ? '/admin' : '/member'} replace />;
  }

  return children;
};

export default ProtectedRoute;

