import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.6:5000';

// Helper function to validate token
const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No token found in storage');
      return false;
    }
    
    // Test token with a simple API call
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      console.log('Token is valid');
      return true;
    } else {
      console.log('Token is invalid, removing from storage');
      await AsyncStorage.removeItem('token');
      return false;
    }
  } catch (error) {
    console.log('Token validation error:', error.message);
    await AsyncStorage.removeItem('token');
    return false;
  }
};

const useAuthStore = create((set, get) => ({
  authUser: null,
  authRole: null,
  isAuthenticated: false,
  isLoading: false,
  isReportingIncident: false,

  // Initialize auth from storage
  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const role = await AsyncStorage.getItem('role');
      
      if (token && user && role) {
        set({
          authUser: JSON.parse(user),
          authRole: role,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/auth/login`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('Login response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        console.log('Login successful, storing token and user data');
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('role', data.user.role);

        set({
          authUser: data.user,
          authRole: data.user.role,
          isAuthenticated: true,
          isLoading: false
        });

        // Verify token was stored correctly
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Token stored successfully:', storedToken ? 'Yes' : 'No');

        return { success: true, message: data.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      
      let errorMessage = 'Network error. Please try again.';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and ensure the backend server is running.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      return { success: false, message: errorMessage };
    }
  },

  // Signup
  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
        return { success: true, message: data.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('role');

      set({
        authUser: null,
        authRole: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  // Report incident
  reportIncident: async (formData) => {
    set({ isReportingIncident: true });
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Reporting incident with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        set({ isReportingIncident: false });
        return { success: false, message: 'Authentication token not found. Please login again.' };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/report-incident`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Report incident response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Report incident error response:', errorData);
        
        if (response.status === 401) {
          // Token expired or invalid - clear auth state
          await AsyncStorage.multiRemove(['token', 'user', 'role']);
          set({
            authUser: null,
            authRole: null,
            isAuthenticated: false,
            isReportingIncident: false
          });
          return { success: false, message: 'Session expired. Please login again.' };
        }
        
        set({ isReportingIncident: false });
        return { success: false, message: errorData.message || 'Failed to report incident' };
      }

      const data = await response.json();

      if (data.success) {
        set({ isReportingIncident: false });
        return { success: true, message: data.message };
      } else {
        set({ isReportingIncident: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Report incident error:', error);
      set({ isReportingIncident: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        set({
          authUser: data.user,
          isLoading: false
        });
        return { success: true, message: data.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Check if user is already logged in
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const role = await AsyncStorage.getItem('role');

      if (token && user) {
        console.log('Found stored token and user, validating...');
        
        // Validate token before setting auth state
        const isValid = await validateToken();
        if (isValid) {
          set({
            authUser: JSON.parse(user),
            authRole: role,
            isAuthenticated: true,
          });
          console.log('Token validation successful, user authenticated');
        } else {
          console.log('Token validation failed, clearing auth state');
          await AsyncStorage.multiRemove(['token', 'user', 'role']);
          set({
            authUser: null,
            authRole: null,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('No stored token or user found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear invalid auth data
      await AsyncStorage.multiRemove(['token', 'user', 'role']);
      set({
        authUser: null,
        authRole: null,
        isAuthenticated: false,
      });
    }
  }
}));

export { useAuthStore };
