// Simple network test - just try different URLs
export const quickNetworkTest = async () => {
  const urls = [
    'http://192.168.1.7:5000',
    'http://10.0.2.2:5000', 
    'http://127.0.0.1:5000',
    'http://localhost:5000'
  ];
  
  console.log('🔍 Testing network connectivity...');
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      // Test a known endpoint that should exist
      const response = await fetch(`${url}/api/community/posts`, { 
        method: 'GET',
        timeout: 5000 
      });
      
      // Accept 200, 401 (unauthorized), or 404 (endpoint exists but needs auth)
      if (response.ok || response.status === 401 || response.status === 404) {
        console.log(`✅ SUCCESS: ${url} (Status: ${response.status})`);
        return { success: true, url };
      } else {
        console.log(`❌ FAILED: ${url} (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ No working URL found');
  return { success: false, url: null };
};
