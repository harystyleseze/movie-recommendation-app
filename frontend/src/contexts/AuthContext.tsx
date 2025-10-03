import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiService, AuthManager } from '@/services/api';
import type { User, RegisterData, LoginData } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = AuthManager.getToken();
        const savedUser = AuthManager.getUser();

        if (token && savedUser) {
          // Verify token is still valid by fetching fresh user data
          try {
            const response = await apiService.getProfile();
            const freshUser = response.data.profile;
            setUser(freshUser);
            setIsAuthenticated(true);
            AuthManager.setUser(freshUser); // Update cached user data
          } catch {
            // Token is invalid, clear auth state
            AuthManager.removeToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(data);
      const { user: loggedInUser } = response.data;

      setUser(loggedInUser);
      setIsAuthenticated(true);

      // Token and user are already saved in apiService.login
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await apiService.register(data);
      const { user: registeredUser } = response.data;

      setUser(registeredUser);
      setIsAuthenticated(true);

      // Token and user are already saved in apiService.register
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(data);
      const updatedUser = response.data.profile;
      setUser(updatedUser);
      // User is already saved in apiService.updateProfile
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.getProfile();
      const freshUser = response.data.profile;
      setUser(freshUser);
      AuthManager.setUser(freshUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, might mean token is invalid
      logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};