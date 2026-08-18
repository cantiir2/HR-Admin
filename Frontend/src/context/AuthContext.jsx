import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    try {
      const [resMenus, resMe] = await Promise.all([
        api.get('/api/auth/menus'),
        api.get('/api/auth/me')
      ]);
      if (resMenus.data?.success) {
        setMenus(resMenus.data.data);
      }
      if (resMe.data?.user) {
        setUser(resMe.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic menus:', err);
    }
  }, []);

  useEffect(() => {
    // Check if the user is already authenticated via cookie
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
        await fetchMenus();
      } catch (err) {
        // Not authenticated
        setUser(null);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [fetchMenus]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    await fetchMenus();
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setMenus([]);
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    const res = await api.get('/api/auth/me');
    setUser(res.data.user);
    await fetchMenus();
    return res.data.user;
  };

  const isRouteAllowed = useCallback((pathname) => {
    if (!user) return false;

    // Common bypass routes
    if (pathname === '/login' || pathname === '/member/profile' || pathname.startsWith('/member/notifications') || pathname.startsWith('/admin/notifications')) {
      return true;
    }

    // Check if pathname matches any allowed menu 'to' path
    const checkMenuMatch = (items) => {
      return items.some(item => {
        if (item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`))) {
          return true;
        }
        if (item.subItems && item.subItems.length > 0) {
          return checkMenuMatch(item.subItems);
        }
        return false;
      });
    };

    return checkMenuMatch(menus);
  }, [user, menus]);

  return (
    <AuthContext.Provider value={{ user, menus, loading, login, logout, refreshUser, setUser, fetchMenus, isRouteAllowed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

