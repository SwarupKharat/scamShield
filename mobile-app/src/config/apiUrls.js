// Multiple API URL options for different scenarios
const API_URLS = {
  // Your current IP (for physical device on same network)
  current: 'http://192.168.1.7:5000',
  
  // Android Emulator
  android: 'http://10.0.2.2:5000',
  
  // iOS Simulator
  ios: 'http://127.0.0.1:5000',
  
  // Localhost (for web)
  localhost: 'http://localhost:5000',
  
  // Alternative IPs to try
  alternative1: 'http://192.168.0.1:5000',
  alternative2: 'http://10.0.0.1:5000',
};

// Auto-detect the best API URL
const detectBestAPIUrl = async () => {
  const urls = Object.values(API_URLS);
  
  for (const url of urls) {
    try {
      console.log(`Testing API URL: ${url}`);
      const response = await fetch(`${url}/api/community/posts`, {
        method: 'GET',
        timeout: 3000,
      });
      
      if (response.ok || response.status === 401) {
        console.log(`✅ Working API URL found: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`);
      continue;
    }
  }
  
  // Fallback to current IP
  return API_URLS.current;
};

// Export the detected URL
export const API_BASE_URL = API_URLS.current; // Will be updated dynamically

// Function to update API URL
export const updateAPIUrl = (newUrl) => {
  return newUrl;
};
