import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.6:5000';

const UserDashboard = ({ navigation }) => {
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    recentIncidents: [],
    userInfo: null
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('No token found in storage');
        Alert.alert('Session Expired', 'Please login again');
        logout();
        return;
      }

      console.log('Token found:', token.substring(0, 20) + '...');
      
      // Fetch current user info
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Unauthorized - token may be invalid or expired');
        const errorData = await response.json();
        console.log('Error details:', errorData);
        
        Alert.alert(
          'Authentication Failed',
          errorData.message || 'Please login again',
          [
            {
              text: 'OK',
              onPress: () => logout()
            }
          ]
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User data received:', data);

      if (data.success) {
        setStats(prev => ({
          ...prev,
          userInfo: data.user
        }));
      }

      // Try to fetch user incidents (optional)
      try {
        const incidentsResponse = await fetch(`${API_BASE_URL}/api/auth/user-incidents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          setStats(prev => ({
            ...prev,
            totalIncidents: incidentsData.incidents?.length || 0,
            recentIncidents: incidentsData.incidents?.slice(0, 5) || []
          }));
        }
      } catch (incidentsError) {
        console.log('Could not fetch incidents:', incidentsError.message);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [
          { text: 'Retry', onPress: fetchDashboardData },
          { text: 'Cancel' }
        ]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Report Incident',
      icon: '📝',
      onPress: () => navigation.navigate('IncidentForm'),
      color: '#e74c3c',
    },
    {
      title: 'Community',
      icon: '👥',
      onPress: () => navigation.navigate('Community'),
      color: '#3498db',
    },
    {
      title: 'Scam Map',
      icon: '🗺️',
      onPress: () => navigation.navigate('Map'),
      color: '#2ecc71',
    },
    {
      title: 'Helpline',
      icon: '📞',
      onPress: () => navigation.navigate('Helpline'),
      color: '#f39c12',
    },
    {
      title: 'Scammer Database',
      icon: '🛡️',
      onPress: () => navigation.navigate('ScammerDatabase'),
      color: '#9b59b6',
    },
    {
      title: 'Profile',
      icon: '👤',
      onPress: () => navigation.navigate('Profile'),
      color: '#34495e',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>
            {stats.userInfo?.firstName || authUser?.name || 'User'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {stats.userInfo && (
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoTitle}>
            Welcome, {stats.userInfo.firstName || stats.userInfo.name}!
          </Text>
          <Text style={styles.userInfoText}>Email: {stats.userInfo.email}</Text>
          <Text style={styles.userInfoText}>Role: {stats.userInfo.role}</Text>
          {stats.userInfo.mobile && (
            <Text style={styles.userInfoText}>Mobile: {stats.userInfo.mobile}</Text>
          )}
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalIncidents || 0}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.resolvedIncidents || 0}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingIncidents || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {stats.recentIncidents.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          {stats.recentIncidents.slice(0, 3).map((incident, index) => (
            <View key={index} style={styles.incidentCard}>
              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <Text style={styles.incidentStatus}>
                Status: {incident.status}
              </Text>
              <Text style={styles.incidentDate}>
                {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  userInfoCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  recentContainer: {
    padding: 20,
  },
  incidentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  incidentStatus: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  incidentDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
});

export default UserDashboard;
