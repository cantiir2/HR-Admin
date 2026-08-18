import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const usePermission = () => {
  const location = useLocation();
  const { user } = useAuth();

  const canAccess = ({ action, apiMethod, apiUrl } = {}) => {
    if (!user) return false;

    const userPermissions = user.permissions || [];
    const currentPath = location.pathname;

    // 2. Map standard UI action to HTTP method
    const actionMethodMap = {
      list: 'GET',
      search: 'POST',
      add: 'POST',
      create: 'POST',
      edit: 'PUT',
      update: 'PUT',
      delete: 'DELETE',
      remove: 'DELETE',
      export: 'GET'
    };

    const targetMethod = (apiMethod || actionMethodMap[action] || action || '*').toUpperCase();

    // 3. Evaluate matching permission entries
    return userPermissions.some(perm => {
      // Check HTTP method match
      const methodMatch = perm.apiMethod === '*' || perm.apiMethod.toUpperCase() === targetMethod;

      // Check URL match: if explicit apiUrl is provided, match against it. Otherwise match against current route
      if (apiUrl) {
        let pattern = perm.apiUrl ? perm.apiUrl.trim() : '';
        if (pattern.endsWith('/*')) {
          pattern = pattern.slice(0, -2);
        }
        return methodMatch && (apiUrl === pattern || apiUrl.startsWith(`${pattern}/`));
      }

      // Default route-based match
      if (perm.menuUrl) {
        const menuPattern = perm.menuUrl.trim();
        return methodMatch && (currentPath === menuPattern || currentPath.startsWith(`${menuPattern}/`));
      }

      return false;
    });
  };

  return { canAccess };
};

export default usePermission;
