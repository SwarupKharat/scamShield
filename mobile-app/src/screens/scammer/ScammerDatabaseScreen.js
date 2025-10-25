import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const ScammerDatabaseScreen = ({ navigation }) => {
  const [scammers, setScammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    verificationStatus: '',
    scamType: '',
    riskLevel: '',
  });
  const [selectedScammer, setSelectedScammer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchScammers();
  }, [searchQuery, filters]);

  const fetchScammers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams({
        page: 1,
        limit: 50,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.verificationStatus && { verificationStatus: filters.verificationStatus }),
        ...(filters.scamType && { scamType: filters.scamType }),
        ...(filters.riskLevel && { riskLevel: filters.riskLevel }),
      });

      console.log('Fetching scammers from:', `${API_BASE_URL}/api/scammers?${params}`);

      const response = await fetch(`${API_BASE_URL}/api/scammers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Scammers response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Scammers data received:', data);
        setScammers(data.scammers || data.data?.scammers || []);
      } else {
        console.log('Failed to fetch scammers:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Failed to load scammers',
          text2: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error fetching scammers:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load scammer database',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScammers();
    setRefreshing(false);
  };

  const getVerificationBadge = (status) => {
    const badges = {
      verified: { color: '#2ecc71', text: 'VERIFIED' },
      pending: { color: '#f39c12', text: 'PENDING' },
      rejected: { color: '#e74c3c', text: 'REJECTED' },
      'under-review': { color: '#3498db', text: 'UNDER REVIEW' },
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <View style={[styles.verificationBadge, { backgroundColor: badge.color }]}>
        <Text style={styles.verificationText}>{badge.text}</Text>
      </View>
    );
  };

  const getRiskBadge = (level) => {
    const colors = {
      low: '#2ecc71',
      medium: '#f39c12',
      high: '#e67e22',
      critical: '#e74c3c',
    };
    
    return (
      <View style={[styles.riskBadge, { backgroundColor: colors[level] || colors.medium }]}>
        <Text style={styles.riskText}>{level.toUpperCase()}</Text>
      </View>
    );
  };

  const openScammerDetails = (scammer) => {
    setSelectedScammer(scammer);
    setShowDetails(true);
  };

  const filteredScammers = scammers.filter(scammer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        scammer.name.toLowerCase().includes(query) ||
        scammer.phoneNumber.toLowerCase().includes(query) ||
        (scammer.upiId && scammer.upiId.toLowerCase().includes(query)) ||
        (scammer.email && scammer.email.toLowerCase().includes(query)) ||
        scammer.scamType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading scammer database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scammer Database</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, UPI ID, email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filters.verificationStatus === '' && styles.filterButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, verificationStatus: '' }))}
          >
            <Text style={[styles.filterText, filters.verificationStatus === '' && styles.filterTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          {['verified', 'pending', 'rejected', 'under-review'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filters.verificationStatus === status && styles.filterButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, verificationStatus: status }))}
            >
              <Text style={[styles.filterText, filters.verificationStatus === status && styles.filterTextActive]}>
                {status.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scamTypeFilters}>
          <TouchableOpacity
            style={[styles.filterButton, filters.scamType === '' && styles.filterButtonActive]}
            onPress={() => setFilters(prev => ({ ...prev, scamType: '' }))}
          >
            <Text style={[styles.filterText, filters.scamType === '' && styles.filterTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          {['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'upi-fraud', 'banking', 'other'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, filters.scamType === type && styles.filterButtonActive]}
              onPress={() => setFilters(prev => ({ ...prev, scamType: type }))}
            >
              <Text style={[styles.filterText, filters.scamType === type && styles.filterTextActive]}>
                {type.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scammersContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredScammers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No scammers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter criteria</Text>
          </View>
        ) : (
          filteredScammers.map((scammer) => (
            <TouchableOpacity
              key={scammer._id}
              style={styles.scammerCard}
              onPress={() => openScammerDetails(scammer)}
            >
              <View style={styles.scammerHeader}>
                <Text style={styles.scammerName}>{scammer.name}</Text>
                <View style={styles.badgesContainer}>
                  {getVerificationBadge(scammer.verificationStatus)}
                  {getRiskBadge(scammer.riskLevel)}
                </View>
              </View>

              <Text style={styles.scammerDescription} numberOfLines={2}>
                {scammer.description}
              </Text>

              <View style={styles.scammerInfo}>
                <Text style={styles.scammerPhone}>📞 {scammer.phoneNumber}</Text>
                {scammer.upiId && (
                  <Text style={styles.scammerUpi}>💳 {scammer.upiId}</Text>
                )}
                {scammer.email && (
                  <Text style={styles.scammerEmail}>📧 {scammer.email}</Text>
                )}
              </View>

              <View style={styles.scammerFooter}>
                <Text style={styles.scamType}>
                  {scammer.scamType.replace('-', ' ').toUpperCase()}
                </Text>
                <Text style={styles.reportCount}>
                  {scammer.reportCount} reports
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Scammer Details Modal */}
      {showDetails && selectedScammer && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedScammer.name}</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalBadges}>
                {getVerificationBadge(selectedScammer.verificationStatus)}
                {getRiskBadge(selectedScammer.riskLevel)}
              </View>

              <Text style={styles.modalDescription}>{selectedScammer.description}</Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contact Information</Text>
                <Text style={styles.modalInfo}>📞 {selectedScammer.phoneNumber}</Text>
                {selectedScammer.upiId && (
                  <Text style={styles.modalInfo}>💳 {selectedScammer.upiId}</Text>
                )}
                {selectedScammer.email && (
                  <Text style={styles.modalInfo}>📧 {selectedScammer.email}</Text>
                )}
                {selectedScammer.website && (
                  <Text style={styles.modalInfo}>🌐 {selectedScammer.website}</Text>
                )}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Scam Details</Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Type:</Text> {selectedScammer.scamType.replace('-', ' ').toUpperCase()}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Reports:</Text> {selectedScammer.reportCount} ({selectedScammer.uniqueReporters} unique)
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Last Reported:</Text> {new Date(selectedScammer.lastReportedAt).toLocaleDateString()}
                </Text>
              </View>

              {selectedScammer.aliases && selectedScammer.aliases.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Known Aliases</Text>
                  <View style={styles.aliasesContainer}>
                    {selectedScammer.aliases.map((alias, index) => (
                      <View key={index} style={styles.aliasTag}>
                        <Text style={styles.aliasText}>{alias}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  scamTypeFilters: {
    marginTop: 10,
  },
  scammersContainer: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  scammerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scammerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  scammerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  verificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  scammerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  scammerInfo: {
    marginBottom: 10,
  },
  scammerPhone: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  scammerUpi: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  scammerEmail: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  scammerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scamType: {
    fontSize: 12,
    color: '#9b59b6',
    fontWeight: '600',
  },
  reportCount: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    padding: 20,
  },
  modalBadges: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalLabel: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  aliasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  aliasTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  aliasText: {
    fontSize: 12,
    color: '#2c3e50',
  },
});

export default ScammerDatabaseScreen;
