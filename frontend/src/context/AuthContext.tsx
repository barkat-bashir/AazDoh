import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aazdoh_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('aazdoh_token');
    const savedUser = localStorage.getItem('aazdoh_user');
    if (!savedToken || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !!localStorage.getItem('aazdoh_token'));

  useEffect(() => {
    if (token) {
      authApi.getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('aazdoh_user', JSON.stringify(profile));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('aazdoh_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('aazdoh_token', newToken);
    localStorage.setItem('aazdoh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('aazdoh_token');
    localStorage.removeItem('aazdoh_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('aazdoh_user', JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
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
