import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi, clearToken } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify token is still valid
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
          } else {
            // Token invalid, clear auth
            clearToken();
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          clearToken();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = (jwt: string, userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, jwt);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    clearToken();
  };
  
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
