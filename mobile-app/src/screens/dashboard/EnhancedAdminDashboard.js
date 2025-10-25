import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const EnhancedAdminDashboard = ({ navigation }) => {
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalIncidents: 0,
    totalUsers: 0,
    totalScammers: 0,
    verifiedScammers: 0,
    pendingApprovals: 0,
    recentIncidents: [],
    recentUsers: [],
    scammerStats: {}
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching admin dashboard data...');
      
      // Fetch dashboard stats from the correct endpoint
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let newStats = {
        totalIncidents: 0,
        totalUsers: 0,
        totalScammers: 0,
        verifiedScammers: 0,
        pendingApprovals: 0,
        recentIncidents: [],
        recentUsers: [],
        scammerStats: {}
      };

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Dashboard stats received:', statsData);
        
        if (statsData.success && statsData.stats) {
          newStats = {
            totalIncidents: statsData.stats.totalIncidents || 0,
            totalUsers: statsData.stats.totalUsers || 0,
            pendingApprovals: statsData.stats.pendingRegistrations || 0,
            recentIncidents: statsData.stats.recentIncidents || [],
            resolvedIncidents: statsData.stats.resolvedIncidents || 0,
            openIncidents: statsData.stats.openIncidents || 0,
            inProgressIncidents: statsData.stats.inProgressIncidents || 0,
            resolutionRate: statsData.stats.resolutionRate || 0
          };
        }
      } else {
        console.log('Failed to fetch dashboard stats:', statsResponse.status);
      }

      // Try to fetch scammer statistics (optional)
      try {
        const scammersResponse = await fetch(`${API_BASE_URL}/api/scammers/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (scammersResponse.ok) {
          const scammerData = await scammersResponse.json();
          newStats.totalScammers = scammerData.totalScammers || 0;
          newStats.verifiedScammers = scammerData.verifiedScammers || 0;
        }
      } catch (scammerError) {
        console.log('Could not fetch scammer stats:', scammerError.message);
      }

      setStats(newStats);
      console.log('Admin dashboard data loaded:', newStats);
      
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
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
  

  const adminMenuItems = [
    {
      title: 'User Approvals',
      icon: 'person-add',
      color: '#3498db',
      onPress: () => navigation.navigate('UserApprovals'),
      count: stats.pendingApprovals,
    },
    {
      title: 'All Incidents',
      icon: 'report-problem',
      color: '#e74c3c',
      onPress: () => navigation.navigate('IncidentManagement'),
      count: stats.totalIncidents,
    },
    {
      title: 'User Management',
      icon: 'people',
      color: '#2ecc71',
      onPress: () => navigation.navigate('UserManagement'),
      count: stats.totalUsers,
    },
    {
      title: 'Scammer Database',
      icon: 'security',
      color: '#9b59b6',
      onPress: () => navigation.navigate('ScammerDatabase'),
      count: stats.totalScammers,
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      color: '#f39c12',
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      title: 'System Settings',
      icon: 'settings',
      color: '#34495e',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentItem = (item, type) => (
    <TouchableOpacity key={item._id} style={styles.recentItem}>
      <View style={styles.recentItemContent}>
        <Text style={styles.recentItemTitle}>
          {type === 'incident' ? item.title : `${item.firstName} ${item.lastName}`}
        </Text>
        <Text style={styles.recentItemSubtitle}>
          {type === 'incident' ? item.status : item.email}
        </Text>
        <Text style={styles.recentItemDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Icon 
        name={type === 'incident' ? 'report-problem' : 'person'} 
        size={20} 
        color="#666" 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.adminName}>{authUser?.firstName || 'Admin'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Incidents',
            stats.totalIncidents,
            'report-problem',
            '#e74c3c',
            () => {
              Toast.show({
                type: 'info',
                text1: 'Total Incidents',
                text2: `${stats.totalIncidents} incidents reported`,
              });
            }
          )}
          {renderStatCard(
            'Total Users',
            stats.totalUsers,
            'people',
            '#2ecc71',
            () => {
              Toast.show({
                type: 'info',
                text1: 'Total Users',
                text2: `${stats.totalUsers} registered users`,
              });
            }
          )}
          {renderStatCard(
            'Scammers',
            stats.totalScammers,
            'security',
            '#9b59b6',
            () => navigation.navigate('ScammerDatabase')
          )}
          {renderStatCard(
            'Pending Approvals',
            stats.pendingApprovals,
            'person-add',
            '#f39c12',
            () => {
              Toast.show({
                type: 'info',
                text1: 'Pending Approvals',
                text2: `${stats.pendingApprovals} users awaiting approval`,
              });
            }
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <View style={styles.actionContent}>
                <Icon name={item.icon} size={32} color="#fff" />
                <Text style={styles.actionTitle}>{item.title}</Text>
                {item.count !== undefined && (
                  <Text style={styles.actionCount}>{item.count}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.recentSection}>
          <Text style={styles.recentSectionTitle}>Latest Incidents</Text>
          {stats.recentIncidents.length > 0 ? (
            stats.recentIncidents.slice(0, 3).map(incident => 
              renderRecentItem(incident, 'incident')
            )
          ) : (
            <Text style={styles.emptyText}>No recent incidents</Text>
          )}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.recentSectionTitle}>System Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Resolution Rate</Text>
              <Text style={styles.overviewValue}>{stats.resolutionRate}%</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Open Incidents</Text>
              <Text style={styles.overviewValue}>{stats.openIncidents}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>In Progress</Text>
              <Text style={styles.overviewValue}>{stats.inProgressIncidents}</Text>
            </View>
          </View>
        </View>
      </View>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  actionCount: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.8,
  },
  recentContainer: {
    padding: 20,
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  recentItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentItemDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default EnhancedAdminDashboard;
