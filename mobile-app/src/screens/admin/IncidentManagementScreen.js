import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const IncidentManagementScreen = ({ navigation }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [processingIncident, setProcessingIncident] = useState(null);

  const filters = [
    { key: 'all', label: 'All', color: '#95a5a6' },
    { key: 'reported', label: 'Reported', color: '#f39c12' },
    { key: 'under_review', label: 'Under Review', color: '#3498db' },
    { key: 'resolved', label: 'Resolved', color: '#27ae60' },
    { key: 'rejected', label: 'Rejected', color: '#e74c3c' },
  ];

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching incidents with filter:', filter);
      
      const url = filter === 'all' 
        ? `${API_BASE_URL}/api/admin/view-incidents`
        : `${API_BASE_URL}/api/admin/view-incidents?status=${filter}`;
      
      const response = await fetch(url, {
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
      } else {
        console.log('Failed to fetch incidents:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load incidents',
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

  const handleStatusUpdate = (incidentId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => updateIncidentStatus(incidentId, newStatus),
          style: 'default'
        }
      ]
    );
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    setProcessingIncident(incidentId);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/update-incident-status/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Incident status updated successfully',
        });
        fetchIncidents(); // Refresh the list
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update status',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
    } finally {
      setProcessingIncident(null);
    }
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
      reported: '#f39c12',
      under_review: '#3498db',
      resolved: '#27ae60',
      rejected: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderIncidentCard = (incident) => (
    <TouchableOpacity
      key={incident._id}
      style={styles.incidentCard}
      onPress={() => navigation.navigate('ViewIncident', { incidentId: incident._id })}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.incidentInfo}>
          <Text style={styles.incidentTitle} numberOfLines={2}>
            {incident.title}
          </Text>
          <Text style={styles.incidentLocation} numberOfLines={1}>
            📍 {incident.location}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
            <Text style={styles.statusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
            <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.incidentDescription} numberOfLines={2}>
        {incident.description}
      </Text>

      {incident.image && (
        <Image source={{ uri: incident.image }} style={styles.incidentImage} />
      )}

      <View style={styles.incidentFooter}>
        <View style={styles.incidentMeta}>
          <Text style={styles.incidentDate}>
            {formatDate(incident.createdAt)}
          </Text>
          {incident.reportedBy && (
            <Text style={styles.reporterName}>
              by {incident.reportedBy.firstName} {incident.reportedBy.lastName}
            </Text>
          )}
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#3498db' }]}
            onPress={() => handleStatusUpdate(incident._id, 'under_review')}
            disabled={processingIncident === incident._id}
          >
            <Icon name="visibility" size={16} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#27ae60' }]}
            onPress={() => handleStatusUpdate(incident._id, 'resolved')}
            disabled={processingIncident === incident._id}
          >
            <Icon name="check-circle" size={16} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#e74c3c' }]}
            onPress={() => handleStatusUpdate(incident._id, 'rejected')}
            disabled={processingIncident === incident._id}
          >
            <Icon name="cancel" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incident Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Icon name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterButton,
                filter === filterItem.key && styles.filterButtonActive,
                { borderColor: filterItem.color }
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterItem.key && styles.filterButtonTextActive,
                  { color: filter === filterItem.key ? filterItem.color : '#666' }
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{incidents.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {incidents.filter(i => i.status === 'reported').length}
          </Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {incidents.filter(i => i.status === 'under_review').length}
          </Text>
          <Text style={styles.statLabel}>Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {incidents.filter(i => i.status === 'resolved').length}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Incidents List */}
      <View style={styles.content}>
        {incidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="report-problem" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No incidents found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'No incidents have been reported yet'
                : `No incidents with status "${filter.replace('_', ' ')}"`
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Incidents' : `${filters.find(f => f.key === filter)?.label} Incidents`} ({incidents.length})
            </Text>
            {incidents.map(renderIncidentCard)}
          </>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  refreshButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#f8f9fa',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
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
    padding: 16,
    paddingBottom: 8,
  },
  incidentInfo: {
    flex: 1,
    marginRight: 12,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  incidentLocation: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
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
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 20,
  },
  incidentImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  incidentMeta: {
    flex: 1,
  },
  incidentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reporterName: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default IncidentManagementScreen;
