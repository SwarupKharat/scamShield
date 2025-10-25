// API Configuration - Try these one by one until one works:

// Option 1: Your current IP (for physical device) - 404 means server is reachable!
export const API_BASE_URL = 'http://192.168.1.6:5000';

// Option 2: Android Emulator (uncomment if using Android emulator)
// export const API_BASE_URL = 'http://10.0.2.2:5000';

// Option 3: iOS Simulator (uncomment if using iOS simulator)
// export const API_BASE_URL = 'http://127.0.0.1:5000';

// Option 4: Localhost (uncomment if using web)
// export const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile',
  REPORT_INCIDENT: '/api/auth/report-incident',
  
  // Community
  COMMUNITY_POSTS: '/api/community/posts',
  CREATE_POST: '/api/community/posts',
  
  // Map
  MAP_INCIDENTS: '/api/map/incidents',
  MAP_COMMUNITY: '/api/map/community',
  MAP_COMBINED: '/api/map/combined',
  MAP_HOTSPOTS: '/api/map/hotspots',
  
  // Helpline
  HELPLINE_EMERGENCY: '/api/helpline/emergency',
  
  // Scammer Database
  SCAMMERS: '/api/scammers',
  SCAMMER_STATISTICS: '/api/scammers/statistics',
  SCAMMER_SEARCH: '/api/scammers/search',
  
  // Admin
  ADMIN_INCIDENTS: '/api/admin/incidents',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATISTICS: '/api/admin/statistics',
  
  // Authority
  AUTHORITY_INCIDENTS: '/api/authority/incidents',
  AUTHORITY_STATISTICS: '/api/authority/statistics',
};

// Request headers
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// File upload headers
export const getFileUploadHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};
