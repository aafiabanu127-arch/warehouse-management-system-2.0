import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '../api/client';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'STAFF'
  | 'PICKER'
  | 'AUDITOR'
  | 'VIEWER';

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
  department: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ role: UserRole }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get('/users/me/');
    setUser(response.data);
    return response.data;
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser()
        .catch(() => {
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ role: UserRole }> => {
    const response = await apiClient.post('/token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    const loggedInUser = await fetchCurrentUser();
    return { role: loggedInUser.role };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
