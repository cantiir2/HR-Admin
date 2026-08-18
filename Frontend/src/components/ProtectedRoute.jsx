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

  // Check if role is authorized
  const userRolesList = user.roles || [user.role];
  const isSystemAdmin = user.role === 'ADMIN' || userRolesList.includes('System Administrator');
  const isHrAdmin = userRolesList.includes('HR Administrator');

  if (allowedRoles) {
    const hasRoleAccess = allowedRoles.some(r =>
      user.role === r ||
      userRolesList.includes(r) ||
      (r === 'ADMIN' && (isSystemAdmin || isHrAdmin))
    );

    if (!hasRoleAccess) {
      return <Navigate to={isSystemAdmin || isHrAdmin ? '/admin' : '/member'} replace />;
    }
  }

  // Route screen check
  if (!isSystemAdmin && !isRouteAllowed(location.pathname)) {
    return <Navigate to="/member" replace />;
  }

  return children;
};

export default ProtectedRoute;

