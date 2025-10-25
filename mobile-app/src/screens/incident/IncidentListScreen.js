import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

const IncidentListScreen = ({ navigation }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching incidents from:', `${API_BASE_URL}/api/auth/user-incidents`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user-incidents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Incidents response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Incidents data received:', data);
        setIncidents(data.incidents || []);
      } else if (response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Please login again',
        });
        navigation.navigate('Login');
      } else {
        console.log('Failed to fetch incidents:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Failed to load incidents',
          text2: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c',
      critical: '#8e44ad',
    };
    return colors[severity] || '#95a5a6';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      under_review: '#3498db',
      resolved: '#27ae60',
      rejected: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderIncident = (incident) => (
    <TouchableOpacity
      key={incident._id}
      style={styles.incidentCard}
      onPress={() => navigation.navigate('ViewIncident', { incidentId: incident._id })}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.incidentTitleContainer}>
          <Text style={styles.incidentTitle}>{incident.title}</Text>
          <View style={styles.incidentMeta}>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
              <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
              <Text style={styles.statusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </View>

      <Text style={styles.incidentDescription} numberOfLines={3}>
        {incident.description}
      </Text>

      <View style={styles.incidentDetails}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>{incident.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(incident.createdAt)}</Text>
        </View>

        {incident.pincode && (
          <View style={styles.detailRow}>
            <Icon name="pin-drop" size={16} color="#666" />
            <Text style={styles.detailText}>Pincode: {incident.pincode}</Text>
          </View>
        )}
      </View>

      {incident.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: incident.image }} style={styles.incidentImage} />
        </View>
      )}

      {incident.scammerDetails && (
        <View style={styles.scammerDetails}>
          <Text style={styles.scammerTitle}>Scammer Details:</Text>
          <Text style={styles.scammerText}>
            {incident.scammerDetails.name && `Name: ${incident.scammerDetails.name}`}
            {incident.scammerDetails.phoneNumber && `\nPhone: ${incident.scammerDetails.phoneNumber}`}
            {incident.scammerDetails.scamType && `\nType: ${incident.scammerDetails.scamType}`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Incidents</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('IncidentForm')}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {incidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="report-problem" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No incidents reported yet</Text>
            <Text style={styles.emptySubtext}>Report a scam incident to help others</Text>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => navigation.navigate('IncidentForm')}
            >
              <Text style={styles.reportButtonText}>Report Incident</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{incidents.length}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {incidents.filter(i => i.status === 'resolved').length}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {incidents.filter(i => i.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>

            {incidents.map(renderIncident)}
          </>
        )}
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  incidentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  incidentTitleContainer: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  incidentMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  incidentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 12,
  },
  incidentImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  scammerDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  scammerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 4,
  },
  scammerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default IncidentListScreen;
