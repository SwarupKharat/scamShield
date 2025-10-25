// Simple Backend Test Script
// Run this to test if your backend is working

const testBackend = async () => {
  const API_BASE_URL = 'http://192.168.1.7:5000';
  
  console.log('Testing backend server...');
  console.log('API URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic connectivity...');
    const response1 = await fetch(`${API_BASE_URL}/api/auth/test`);
    
    if (response1.ok) {
      const data = await response1.json();
      console.log('✅ Basic connectivity: SUCCESS');
      console.log('Server response:', data.message);
    } else {
      console.log('❌ Basic connectivity: FAILED', response1.status);
    }
    
    // Test 2: Login endpoint
    console.log('\n2. Testing login endpoint...');
    const response2 = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    });
    
    console.log('Login response status:', response2.status);
    if (response2.status === 400 || response2.status === 401) {
      console.log('✅ Login endpoint: ACCESSIBLE (expected auth error)');
    } else {
      console.log('❌ Login endpoint: UNEXPECTED', response2.status);
    }
    
    // Test 3: Community endpoint
    console.log('\n3. Testing community endpoint...');
    const response3 = await fetch(`${API_BASE_URL}/api/community/posts`);
    console.log('Community response status:', response3.status);
    
    if (response3.status === 200 || response3.status === 401) {
      console.log('✅ Community endpoint: ACCESSIBLE');
    } else {
      console.log('❌ Community endpoint: FAILED', response3.status);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
};

// Run the test
testBackend();
