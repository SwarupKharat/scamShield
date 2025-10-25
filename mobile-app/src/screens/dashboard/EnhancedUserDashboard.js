import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const EnhancedUserDashboard = ({ navigation }) => {
  const { authUser, authRole, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    recentIncidents: [],
    userInfo: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDashboardData();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
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
            // Don't navigate manually - App.js will handle it automatically
          }
        },
      ]
    );
  };
  

  const menuItems = [
    {
      title: 'Report Incident',
      icon: 'report-problem',
      color: '#e74c3c',
      gradient: ['#e74c3c', '#c0392b'],
      onPress: () => navigation.navigate('IncidentForm'),
    },
    {
      title: 'My Incidents',
      icon: 'assignment',
      color: '#8e44ad',
      gradient: ['#8e44ad', '#9b59b6'],
      onPress: () => navigation.navigate('IncidentList'),
    },
    {
      title: 'Community',
      icon: 'people',
      color: '#3498db',
      gradient: ['#3498db', '#2980b9'],
      onPress: () => navigation.navigate('Community'),
    },
    {
      title: 'Scam Map',
      icon: 'map',
      color: '#2ecc71',
      gradient: ['#2ecc71', '#27ae60'],
      onPress: () => navigation.navigate('Map'),
    },
    {
      title: 'Helpline',
      icon: 'phone',
      color: '#f39c12',
      gradient: ['#f39c12', '#e67e22'],
      onPress: () => navigation.navigate('Helpline'),
    },
    {
      title: 'Scammer DB',
      icon: 'security',
      color: '#9b59b6',
      gradient: ['#9b59b6', '#8e44ad'],
      onPress: () => navigation.navigate('ScammerDatabase'),
    },
    {
      title: 'Profile',
      icon: 'person',
      color: '#34495e',
      gradient: ['#34495e', '#2c3e50'],
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const renderStatCard = (title, value, icon, color) => (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          borderLeftColor: color,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
      </View>
    </Animated.View>
  );

  const renderMenuItem = (item, index) => (
    <Animated.View
      key={index}
      style={[
        styles.menuItemContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.menuItemGradient}
        >
          <View style={styles.menuItemContent}>
            <Icon name={item.icon} size={28} color="#fff" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {stats.userInfo?.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>
                {stats.userInfo?.firstName || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('Total Reports', stats.totalIncidents, 'report-problem', '#e74c3c')}
          {renderStatCard('Resolved', stats.resolvedIncidents, 'check-circle', '#27ae60')}
          {renderStatCard('Pending', stats.pendingIncidents, 'schedule', '#f39c12')}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>
      </View>

      {/* Recent Incidents */}
      {stats.recentIncidents.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          {stats.recentIncidents.map((incident, index) => (
            <Animated.View
              key={incident._id}
              style={[
                styles.incidentCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.incidentContent}>
                <Text style={styles.incidentTitle}>{incident.title}</Text>
                <Text style={styles.incidentStatus}>
                  Status: {incident.status}
                </Text>
                <Text style={styles.incidentDate}>
                  {new Date(incident.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#b0b0b0',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 3,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItemContainer: {
    width: (width - 60) / 2,
    marginBottom: 15,
  },
  menuItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItemGradient: {
    padding: 20,
  },
  menuItemContent: {
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  recentContainer: {
    padding: 20,
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentContent: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  incidentStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  incidentDate: {
    fontSize: 10,
    color: '#999',
  },
});

export default EnhancedUserDashboard;
