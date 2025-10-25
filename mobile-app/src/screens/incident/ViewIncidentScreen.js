import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ViewIncidentScreen = ({ route, navigation }) => {
  const { incidentId } = route.params;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [incidentId]);

  const fetchIncident = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching incident:', incidentId);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/view-incident/${incidentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Incident response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Incident data received:', data);
        setIncident(data.incident || data);
      } else {
        console.log('Failed to fetch incident:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load incident details',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncident();
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => updateIncidentStatus(newStatus),
          style: 'default'
        }
      ]
    );
  };

  const updateIncidentStatus = async (newStatus) => {
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
        fetchIncident(); // Refresh data
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
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading incident details...</Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Incident not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Incident Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="more-vert" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Incident Content */}
      <View style={styles.content}>
        {/* Title and Status */}
        <View style={styles.titleSection}>
          <Text style={styles.incidentTitle}>{incident.title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
              <Text style={styles.statusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
              <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>{incident.description}</Text>
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#666" />
            <Text style={styles.detailText}>{incident.location}</Text>
          </View>
          {incident.pincode && (
            <View style={styles.detailRow}>
              <Icon name="pin-drop" size={20} color="#666" />
              <Text style={styles.detailText}>Pincode: {incident.pincode}</Text>
            </View>
          )}
        </View>

        {/* Incident Image */}
        {incident.image && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <Image source={{ uri: incident.image }} style={styles.incidentImage} />
          </View>
        )}

        {/* Scammer Details */}
        {incident.scammerDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scammer Information</Text>
            <View style={styles.scammerCard}>
              {incident.scammerDetails.name && (
                <View style={styles.detailRow}>
                  <Icon name="person" size={20} color="#666" />
                  <Text style={styles.detailText}>{incident.scammerDetails.name}</Text>
                </View>
              )}
              {incident.scammerDetails.phoneNumber && (
                <View style={styles.detailRow}>
                  <Icon name="phone" size={20} color="#666" />
                  <Text style={styles.detailText}>{incident.scammerDetails.phoneNumber}</Text>
                </View>
              )}
              {incident.scammerDetails.upiId && (
                <View style={styles.detailRow}>
                  <Icon name="payment" size={20} color="#666" />
                  <Text style={styles.detailText}>{incident.scammerDetails.upiId}</Text>
                </View>
              )}
              {incident.scammerDetails.email && (
                <View style={styles.detailRow}>
                  <Icon name="email" size={20} color="#666" />
                  <Text style={styles.detailText}>{incident.scammerDetails.email}</Text>
                </View>
              )}
              {incident.scammerDetails.website && (
                <View style={styles.detailRow}>
                  <Icon name="web" size={20} color="#666" />
                  <Text style={styles.detailText}>{incident.scammerDetails.website}</Text>
                </View>
              )}
              {incident.scammerDetails.scamType && (
                <View style={styles.detailRow}>
                  <Icon name="security" size={20} color="#666" />
                  <Text style={styles.detailText}>Type: {incident.scammerDetails.scamType}</Text>
                </View>
              )}
              {incident.scammerDetails.description && (
                <Text style={styles.scammerDescription}>
                  {incident.scammerDetails.description}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Reported</Text>
              <Text style={styles.timelineDate}>{formatDate(incident.createdAt)}</Text>
            </View>
          </View>
          {incident.updatedAt && incident.updatedAt !== incident.createdAt && (
            <View style={styles.timelineItem}>
              <Icon name="update" size={20} color="#666" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Last Updated</Text>
                <Text style={styles.timelineDate}>{formatDate(incident.updatedAt)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Reporter Information */}
        {incident.reportedBy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reporter Information</Text>
            <View style={styles.reporterCard}>
              <View style={styles.reporterInfo}>
                <View style={styles.reporterAvatar}>
                  <Text style={styles.reporterInitial}>
                    {incident.reportedBy.firstName?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.reporterDetails}>
                  <Text style={styles.reporterName}>
                    {incident.reportedBy.firstName} {incident.reportedBy.lastName}
                  </Text>
                  <Text style={styles.reporterEmail}>{incident.reportedBy.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Admin Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3498db' }]}
              onPress={() => handleStatusUpdate('under_review')}
            >
              <Icon name="visibility" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Under Review</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
              onPress={() => handleStatusUpdate('resolved')}
            >
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={() => handleStatusUpdate('rejected')}
            >
              <Icon name="cancel" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  incidentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  severityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  incidentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  scammerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  scammerDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineContent: {
    marginLeft: 12,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reporterCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reporterInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  reporterEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ViewIncidentScreen;
