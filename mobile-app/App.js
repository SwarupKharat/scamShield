import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import EnhancedLoginScreen from './src/screens/auth/EnhancedLoginScreen';
import EnhancedSignupScreen from './src/screens/auth/EnhancedSignupScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import UserDashboard from './src/screens/dashboard/UserDashboard';
import EnhancedUserDashboard from './src/screens/dashboard/EnhancedUserDashboard';
import SplashScreen from './src/screens/auth/SplashScreen';
import AdminDashboard from './src/screens/dashboard/AdminDashboard';
import EnhancedAdminDashboard from './src/screens/dashboard/EnhancedAdminDashboard';
import AuthorityDashboard from './src/screens/dashboard/AuthorityDashboard';
import IncidentFormScreen from './src/screens/incident/IncidentFormScreen';
import IncidentListScreen from './src/screens/incident/IncidentListScreen';
import ViewIncidentScreen from './src/screens/incident/ViewIncidentScreen';
import CommunityScreen from './src/screens/community/CommunityScreen';
import InstagramCommunityScreen from './src/screens/community/InstagramCommunityScreen';
import MapScreen from './src/screens/map/MapScreen';
import HelplineScreen from './src/screens/helpline/HelplineScreen';
import ScammerDatabaseScreen from './src/screens/scammer/ScammerDatabaseScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EnhancedProfileScreen from './src/screens/profile/EnhancedProfileScreen';
import UserApprovalsScreen from './src/screens/admin/UserApprovalsScreen';
import IncidentManagementScreen from './src/screens/admin/IncidentManagementScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import EnhancedAuthorityDashboard from './src/screens/dashboard/EnhancedAuthorityDashboard';
import AnalyticsScreen from './src/screens/analytics/AnalyticsScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';
import NetworkDebugScreen from './src/screens/debug/NetworkDebugScreen';

// Import stores
import { useAuthStore } from './src/stores/authStore';

const Stack = createStackNavigator();

export default function App() {
  const { authUser, authRole, checkAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on app startup
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      // Add a minimum delay for splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };
    initAuth();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoading ? (
            // Show splash screen while loading
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : !isAuthenticated ? (
            // Auth screens - When not authenticated
            <>
              <Stack.Screen name="Login" component={EnhancedLoginScreen} />
              <Stack.Screen name="Signup" component={EnhancedSignupScreen} />
              <Stack.Screen name="NetworkDebug" component={NetworkDebugScreen} />
            </>
          ) : (
            // Main app screens - Based on role
            <>
              {authRole === 'admin' && (
                <Stack.Screen 
                  name="AdminDashboard" 
                  component={EnhancedAdminDashboard}
                  options={{ gestureEnabled: false }}
                />
              )}
              {authRole === 'authority' && (
                <Stack.Screen 
                  name="AuthorityDashboard" 
                  component={EnhancedAuthorityDashboard}
                  options={{ gestureEnabled: false }}
                />
              )}
              {authRole === 'user' && (
                <Stack.Screen 
                  name="UserDashboard" 
                  component={EnhancedUserDashboard}
                  options={{ gestureEnabled: false }}
                />
              )}
              
              {/* Shared screens - Available to all authenticated users */}
              <Stack.Screen name="IncidentForm" component={IncidentFormScreen} />
              <Stack.Screen name="IncidentList" component={IncidentListScreen} />
              <Stack.Screen name="ViewIncident" component={ViewIncidentScreen} />
              <Stack.Screen name="Community" component={InstagramCommunityScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Helpline" component={HelplineScreen} />
              <Stack.Screen name="ScammerDatabase" component={ScammerDatabaseScreen} />
              <Stack.Screen name="Profile" component={EnhancedProfileScreen} />
              
              {/* Admin screens */}
              <Stack.Screen name="UserApprovals" component={UserApprovalsScreen} />
              <Stack.Screen name="IncidentManagement" component={IncidentManagementScreen} />
              <Stack.Screen name="UserManagement" component={UserManagementScreen} />
              
              {/* Analytics and Settings */}
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              
              <Stack.Screen name="NetworkDebug" component={NetworkDebugScreen} />
            </>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </PaperProvider>
  );
}
