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
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthorityDashboard = ({ navigation }) => {
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState({
    assignedIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    recentIncidents: []
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/authority/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Assigned Incidents',
      icon: '📋',
      onPress: () => navigation.navigate('AssignedIncidents'),
      color: '#e74c3c',
    },
    {
      title: 'Resolve Incident',
      icon: '✅',
      onPress: () => navigation.navigate('ResolveIncident'),
      color: '#2ecc71',
    },
    {
      title: 'Scam Map',
      icon: '🗺️',
      onPress: () => navigation.navigate('Map'),
      color: '#3498db',
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
          <Text style={styles.welcomeText}>Authority Dashboard</Text>
          <Text style={styles.userName}>{authUser?.name || 'Authority'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.assignedIncidents}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.resolvedIncidents}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingIncidents}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Authority Tools</Text>
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
          {stats.recentIncidents.slice(0, 5).map((incident, index) => (
            <View key={index} style={styles.incidentCard}>
              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <Text style={styles.incidentStatus}>
                Status: {incident.status} | Severity: {incident.severity}
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

export default AuthorityDashboard;
