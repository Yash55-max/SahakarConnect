import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchPersona: (personaKey: 'consumer' | 'provider' | 'admin' | 'regulator') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PERSONAS = {
  consumer: {
    email: 'rahul.sharma@example.com',
    name: 'Rahul Sharma (Consumer)',
    role: 'CONSUMER' as Role,
    description: 'Books home plumbing, electrical, and cleaning services.',
  },
  provider: {
    email: 'ramesh.yadav@sahakar.coop',
    name: 'Ramesh Yadav (Provider)',
    role: 'PROVIDER' as Role,
    description: 'Plumber & Member of Delhi Shramik Sahakari Samiti.',
  },
  admin: {
    email: 'admin.delhi@sahakar.coop',
    name: 'Suresh Kumar (Coop Admin)',
    role: 'COOP_ADMIN' as Role,
    description: 'Society Administrator of Delhi Shramik Sahakari Samiti.',
  },
  regulator: {
    email: 'regulator@cooperation.gov.in',
    name: 'Dr. Rajeshwari Nair (Regulator)',
    role: 'REGULATOR' as Role,
    description: 'Joint Registrar, Ministry of Cooperation, Govt. of India.',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sahakar_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('sahakar_token')) {
        const userData = await api.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Failed to load active session, logging out.');
      localStorage.removeItem('sahakar_token');
      localStorage.removeItem('sahakar_refresh_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('sahakar_token', res.accessToken);
      localStorage.setItem('sahakar_refresh_token', res.refreshToken);
      setToken(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('sahakar_token', res.accessToken);
      localStorage.setItem('sahakar_refresh_token', res.refreshToken);
      setToken(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sahakar_token');
    localStorage.removeItem('sahakar_refresh_token');
    setUser(null);
    setToken(null);
  };

  const switchPersona = async (personaKey: 'consumer' | 'provider' | 'admin' | 'regulator') => {
    const persona = DEMO_PERSONAS[personaKey];
    if (persona) {
      await login(persona.email, 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
