import { api, API_ENDPOINTS, handleApiError } from '@/lib/api';

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

// Login interface
export interface LoginData {
  email: string;
  password: string;
}

// Register interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Update profile interface
export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

// Auth service
export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, data);
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Login user
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, data);
      return {
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get(API_ENDPOINTS.ME);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Don't throw error on logout, just clear local storage
      console.error('Logout error:', error);
    }
  }
}; 