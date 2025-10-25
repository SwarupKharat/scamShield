// Network Test Script
// Run this in your mobile app to test connectivity

import { API_BASE_URL } from '../config/api';

const testNetwork = async () => {
  console.log('Testing network connectivity...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic server response
    console.log('Test 1: Basic server response');
    const response1 = await fetch(`${API_BASE_URL}/api/auth/test`, {
      method: 'GET',
      timeout: 5000,
    });
    console.log('Response 1 status:', response1.status);
    
    // Test 2: Login endpoint (should return 400/401 for invalid credentials)
    console.log('Test 2: Login endpoint');
    const response2 = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    });
    console.log('Response 2 status:', response2.status);
    
    // Test 3: Community endpoint
    console.log('Test 3: Community endpoint');
    const response3 = await fetch(`${API_BASE_URL}/api/community/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Response 3 status:', response3.status);
    
    console.log('All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Network test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.name);
    return false;
  }
};

export default testNetwork;
