import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, OrgRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  hasOrgRole: (...roles: OrgRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('hireflow_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const currentUser = response.data.data;
      setUser(currentUser);
      localStorage.setItem('hireflow_user', JSON.stringify(currentUser));
    } catch (error) {
      console.warn('Failed to load authenticated user profile');
      setUser(null);
      localStorage.removeItem('hireflow_user');
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, accessToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('hireflow_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data: any): Promise<User> => {
    const response = await api.post('/auth/register', data);
    const { user: registeredUser, accessToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('hireflow_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue cleanup regardless
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('hireflow_user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  const hasOrgRole = (...roles: OrgRole[]) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (!user.organizationRole) return false;
    return roles.includes(user.organizationRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
        hasOrgRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

