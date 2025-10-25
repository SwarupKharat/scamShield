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

const EnhancedAuthorityDashboard = ({ navigation }) => {
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    underReviewIncidents: 0,
    resolvedIncidents: 0,
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
      console.log('Fetching authority dashboard data...');
      
      // Fetch current user info
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setStats(prev => ({
          ...prev,
          userInfo: userData.user || userData
        }));
      }

      // Fetch incidents data
      const incidentsResponse = await fetch(`${API_BASE_URL}/api/admin/view-incidents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        const incidents = incidentsData.incidents || [];
        
        setStats(prev => ({
          ...prev,
          totalIncidents: incidents.length,
          pendingIncidents: incidents.filter(i => i.status === 'reported').length,
          underReviewIncidents: incidents.filter(i => i.status === 'under_review').length,
          resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
          recentIncidents: incidents.slice(0, 5)
        }));
      }

      console.log('Authority dashboard data loaded:', stats);
      
    } catch (error) {
      console.error('Error fetching authority dashboard data:', error);
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
          }
        },
      ]
    );
  };

  const authorityMenuItems = [
    {
      title: 'All Incidents',
      icon: 'report-problem',
      color: '#e74c3c',
      gradient: ['#e74c3c', '#c0392b'],
      onPress: () => navigation.navigate('IncidentManagement'),
      count: stats.totalIncidents,
    },
    {
      title: 'Pending Review',
      icon: 'schedule',
      color: '#f39c12',
      gradient: ['#f39c12', '#e67e22'],
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Filter Applied',
          text2: 'Showing pending incidents',
        });
        navigation.navigate('IncidentManagement');
      },
      count: stats.pendingIncidents,
    },
    {
      title: 'Under Review',
      icon: 'visibility',
      color: '#3498db',
      gradient: ['#3498db', '#2980b9'],
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Filter Applied',
          text2: 'Showing incidents under review',
        });
        navigation.navigate('IncidentManagement');
      },
      count: stats.underReviewIncidents,
    },
    {
      title: 'Resolved',
      icon: 'check-circle',
      color: '#27ae60',
      gradient: ['#27ae60', '#229954'],
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Filter Applied',
          text2: 'Showing resolved incidents',
        });
        navigation.navigate('IncidentManagement');
      },
      count: stats.resolvedIncidents,
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      color: '#9b59b6',
      gradient: ['#9b59b6', '#8e44ad'],
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Analytics feature will be available soon',
        });
      },
    },
    {
      title: 'Reports',
      icon: 'assessment',
      color: '#34495e',
      gradient: ['#34495e', '#2c3e50'],
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Reports feature will be available soon',
        });
      },
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
            {item.count !== undefined && (
              <Text style={styles.menuItemCount}>{item.count}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading authority dashboard...</Text>
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
                {stats.userInfo?.firstName?.charAt(0) || 'A'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>
                {stats.userInfo?.firstName || 'Authority'}
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
        <Text style={styles.sectionTitle}>Incident Statistics</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('Total', stats.totalIncidents, 'report-problem', '#e74c3c')}
          {renderStatCard('Pending', stats.pendingIncidents, 'schedule', '#f39c12')}
          {renderStatCard('Review', stats.underReviewIncidents, 'visibility', '#3498db')}
          {renderStatCard('Resolved', stats.resolvedIncidents, 'check-circle', '#27ae60')}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {authorityMenuItems.map((item, index) => renderMenuItem(item, index))}
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
              <TouchableOpacity
                onPress={() => navigation.navigate('ViewIncident', { incidentId: incident._id })}
              >
                <View style={styles.incidentContent}>
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                  <Text style={styles.incidentStatus}>
                    Status: {incident.status.replace('_', ' ')}
                  </Text>
                  <Text style={styles.incidentDate}>
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
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
    backgroundColor: '#3498db',
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
    width: (width - 60) / 4,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 8,
    color: '#666',
    marginTop: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  menuItemCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
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

export default EnhancedAuthorityDashboard;
