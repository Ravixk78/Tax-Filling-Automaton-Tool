import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface UserProfile {
  UserID: number;
  Name: string;
  Email: string;
  Role: string;
  PhoneNumber: string;
  Status: string;
  CreatedDate?: string;
  LastLogin?: string | null;
  LicenseNumber?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tfat_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('tfat_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('tfat_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
