import { Alert } from 'react-native';

// Quick network status checker
export const checkNetworkStatus = async () => {
  const testUrls = [
    'http://192.168.1.7:5000',
    'http://10.0.2.2:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5000'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(`${url}/api/community/posts`, {
        method: 'GET',
        timeout: 3000,
      });
      
      if (response.ok || response.status === 401) {
        Alert.alert(
          'Network Status',
          `✅ Connected to: ${url}\n\nUpdate your API_BASE_URL in src/config/api.js to:\n\n${url}`,
          [{ text: 'OK' }]
        );
        return url;
      }
    } catch (error) {
      continue;
    }
  }
  
  Alert.alert(
    'Network Error',
    '❌ Cannot connect to backend server.\n\nMake sure:\n1. Backend server is running\n2. Both devices are on same network\n3. No firewall blocking port 5000',
    [{ text: 'OK' }]
  );
  
  return null;
};
