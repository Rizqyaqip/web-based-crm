import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ketsai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (nama, password) => {
    const res = await loginUser(nama, password);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('ketsai_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login gagal');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ketsai_user');
  }, []);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isAuthenticated = Boolean(user);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isAdmin,
      isStaff,
      isAuthenticated
    }),
    [user, login, logout, isAdmin, isStaff, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
