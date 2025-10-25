import { API_BASE_URL } from '../config/api';

// Network utility functions
export const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Network request failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: error 
    };
  }
};

// Test network connectivity
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/test`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Get your computer's IP address for development
export const getLocalIP = () => {
  // This is a placeholder - you need to manually set your IP
  // Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
  return '192.168.1.7'; // Replace with your actual IP
};

// Network error messages
export const getNetworkErrorMessage = (error) => {
  if (error.includes('Network request failed')) {
    return 'Unable to connect to server. Please check your internet connection and try again.';
  }
  if (error.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (error.includes('ECONNREFUSED')) {
    return 'Server is not running. Please start the backend server.';
  }
  return 'Network error occurred. Please try again.';
};
