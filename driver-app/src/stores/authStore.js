import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  login: async (credentials) => {
    try {
      set({ isLoading: true });
      
      const response = await apiService.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      
      // Store token
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  logout: async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verify token is still valid
        try {
          const response = await apiService.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          set({
            user: response.data.data.user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          // Token invalid, clear storage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiService.put('/auth/profile', profileData);
      const { user } = response.data.data;
      
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      set({ user });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  }
}));
