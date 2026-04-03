import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse } from '@/types';
import { api } from '@/api/client';

interface AuthState {
  token: string | null;
  userID: string | null;
  name: string | null;
  email: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, country: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem('token'),
    userID: localStorage.getItem('userID'),
    name: localStorage.getItem('name'),
    email: localStorage.getItem('email'),
  });

  const persist = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userID', data.userID);
    localStorage.setItem('name', data.name);
    localStorage.setItem('email', data.email);
    setAuth({ token: data.token, userID: data.userID, name: data.name, email: data.email });
  };

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    persist(data);
  };

  const signup = async (name: string, email: string, password: string, country: string) => {
    const data = await api.post<AuthResponse>('/auth/signup', { name, email, password, country });
    persist(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    setAuth({ token: null, userID: null, name: null, email: null });
  };

  return (
    <AuthContext.Provider
      value={{ ...auth, login, signup, logout, isAuthenticated: !!auth.token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
