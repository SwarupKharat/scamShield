import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import UserDashboard from './src/screens/dashboard/UserDashboard';
import AdminDashboard from './src/screens/dashboard/AdminDashboard';
import AuthorityDashboard from './src/screens/dashboard/AuthorityDashboard';
import IncidentFormScreen from './src/screens/incident/IncidentFormScreen';
import CommunityScreen from './src/screens/community/CommunityScreen';
import MapScreen from './src/screens/map/MapScreen';
import HelplineScreen from './src/screens/helpline/HelplineScreen';
import ScammerDatabaseScreen from './src/screens/scammer/ScammerDatabaseScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import NetworkDebugScreen from './src/screens/debug/NetworkDebugScreen';

// Import stores
import { useAuthStore } from './src/stores/authStore';

const Stack = createStackNavigator();

export default function App() {
  const { authUser, authRole, checkAuth } = useAuthStore();

  // Check authentication on app startup
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!authUser ? (
            // Auth screens
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            // Main app screens
            <>
              {authRole === 'admin' && (
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
              )}
              {authRole === 'authority' && (
                <Stack.Screen name="AuthorityDashboard" component={AuthorityDashboard} />
              )}
              {authRole === 'user' && (
                <Stack.Screen name="UserDashboard" component={UserDashboard} />
              )}
              <Stack.Screen name="IncidentForm" component={IncidentFormScreen} />
              <Stack.Screen name="Community" component={CommunityScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Helpline" component={HelplineScreen} />
              <Stack.Screen name="ScammerDatabase" component={ScammerDatabaseScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              
            </>
          )}
          <Stack.Screen name="NetworkDebug" component={NetworkDebugScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </PaperProvider>
  );
}
