import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.6:5000';

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// Helper function to validate token
const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No token found in storage');
      return false;
    }
    
    console.log('Validating token...');
    
    // Test token with /api/auth/me endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Token validation response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Token is valid, user:', data.user?.email);
      return { valid: true, user: data.user };
    } else {
      const errorData = await response.json();
      console.log('Token is invalid:', errorData.message);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('role');
      return { valid: false };
    }
  } catch (error) {
    console.log('Token validation error:', error.message);
    await AsyncStorage.multiRemove(['token', 'user', 'role']);
    return { valid: false };
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
      console.log('Initializing auth...');
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const role = await AsyncStorage.getItem('role');
      
      if (token && user && role) {
        console.log('Found stored credentials, validating...');
        
        // Validate token before setting state
        const validation = await validateToken();
        
        if (validation.valid) {
          set({
            authUser: validation.user || JSON.parse(user),
            authRole: role,
            isAuthenticated: true
          });
          console.log('Auth initialized successfully');
        } else {
          console.log('Stored token invalid, clearing state');
          set({
            authUser: null,
            authRole: null,
            isAuthenticated: false
          });
        }
      } else {
        console.log('No stored credentials found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        authUser: null,
        authRole: null,
        isAuthenticated: false
      });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/auth/login`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful');

      if (data.success && data.token) {
        console.log('Storing credentials...');
        
        // Store credentials
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('role', data.user.role);

        // Verify storage
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Token stored:', storedToken ? 'Yes' : 'No');

        // Update state
        set({
          authUser: data.user,
          authRole: data.user.role,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true, message: data.message || 'Login successful!' };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      
      let errorMessage = 'Network error. Please try again.';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server at ' + API_BASE_URL;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  },

  // Signup
  signup: async (userData) => {
    set({ isLoading: true });
    try {
      console.log('Attempting signup...');
      
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
        return { success: true, message: data.message || 'Registration successful!' };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({ isLoading: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Logout
  // In your authStore.js
logout: async () => {
  try {
    console.log('Logging out...');
    
    await AsyncStorage.multiRemove(['token', 'user', 'role']);

    set({
      authUser: null,
      authRole: null,
      isAuthenticated: false
    });

    console.log('Logout successful');
    
    // Don't navigate here - let the App.js handle it automatically
    // The change in isAuthenticated will trigger re-render
  } catch (error) {
    console.error('Error logging out:', error);
  }
},


  // Report incident
  reportIncident: async (formData) => {
    set({ isReportingIncident: true });
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Reporting incident, token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        set({ isReportingIncident: false });
        return { success: false, message: 'Authentication token not found. Please login again.' };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/report-incident`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      console.log('Report incident response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Report incident error:', errorData);
        
        if (response.status === 401) {
          // Token expired or invalid
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
        return { success: true, message: data.message || 'Incident reported successfully!' };
      } else {
        set({ isReportingIncident: false });
        return { success: false, message: data.message || 'Failed to report incident' };
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
      console.log('Updating profile...');
      
      const response = await makeAuthenticatedRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        set({
          authUser: data.user,
          isLoading: false
        });
        return { success: true, message: data.message || 'Profile updated successfully!' };
      } else {
        set({ isLoading: false });
        return { success: false, message: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      set({ isLoading: false });
      
      if (error.message.includes('No authentication token')) {
        return { success: false, message: 'Please login again.' };
      }
      
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      console.log('Fetching current user...');
      
      const response = await makeAuthenticatedRequest('/api/auth/me', {
        method: 'GET',
      });

      console.log('Get current user response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid, clear auth
          await AsyncStorage.multiRemove(['token', 'user', 'role']);
          set({
            authUser: null,
            authRole: null,
            isAuthenticated: false
          });
          return { success: false, message: 'Session expired. Please login again.' };
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user info');
      }

      const data = await response.json();

      if (data.success) {
        // Update stored user and state
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        set({
          authUser: data.user,
          authRole: data.user.role,
          isAuthenticated: true
        });
        return { success: true, user: data.user };
      }

      return { success: false, message: 'Failed to fetch user info' };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, message: error.message };
    }
  },

  // Check if user is already logged in (called on app start)
  checkAuth: async () => {
    try {
      console.log('Checking auth status...');
      
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      const role = await AsyncStorage.getItem('role');

      if (token && user) {
        console.log('Found stored credentials, validating token...');
        
        // Validate token
        const validation = await validateToken();
        
        if (validation.valid) {
          set({
            authUser: validation.user || JSON.parse(user),
            authRole: role,
            isAuthenticated: true,
          });
          console.log('Auth check successful');
          return true;
        } else {
          console.log('Token validation failed');
          await AsyncStorage.multiRemove(['token', 'user', 'role']);
          set({
            authUser: null,
            authRole: null,
            isAuthenticated: false,
          });
          return false;
        }
      } else {
        console.log('No stored credentials found');
        set({
          authUser: null,
          authRole: null,
          isAuthenticated: false,
        });
        return false;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      await AsyncStorage.multiRemove(['token', 'user', 'role']);
      set({
        authUser: null,
        authRole: null,
        isAuthenticated: false,
      });
      return false;
    }
  }
}));

export { useAuthStore };
