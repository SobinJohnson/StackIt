
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, API_ENDPOINTS, handleApiError } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

// User interface
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Connect to socket
      socketService.connect(savedToken).catch((error) => {
        console.error('Socket connection failed:', error);
      });
    }
    
    setIsLoading(false);
  }, []);

  // Handle real-time notifications
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (data: any) => {
      // Show toast notification
      toast({
        title: 'New Notification',
        description: data.message,
      });

      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    // Listen for new notifications
    socketService.on('new_notification', handleNewNotification);

    return () => {
      socketService.off('new_notification', handleNewNotification);
    };
  }, [user, queryClient, toast]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data;

      // Save to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);

      // Connect to socket
      await socketService.connect(authToken);

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        username,
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data;

      // Save to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);

      // Connect to socket
      await socketService.connect(authToken);

      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Disconnect socket
      socketService.disconnect();

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Update state
      setToken(null);
      setUser(null);

      toast({
        title: 'Success',
        description: 'Logged out successfully!',
      });
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
