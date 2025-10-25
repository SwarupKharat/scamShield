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

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUser, setProcessingUser] = useState(null);

  const filters = [
    { key: 'all', label: 'All Users', color: '#95a5a6' },
    { key: 'active', label: 'Active', color: '#27ae60' },
    { key: 'inactive', label: 'Inactive', color: '#e74c3c' },
    { key: 'pending', label: 'Pending', color: '#f39c12' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching users...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Users response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Users data received:', data);
        setUsers(data.users || []);
      } else {
        console.log('Failed to fetch users:', response.status);
        // Mock data for demonstration
        setUsers([
          {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            mobile: '9876543210',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            incidentCount: 3,
          },
          {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            mobile: '9876543211',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
            lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            incidentCount: 1,
          },
          {
            _id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            mobile: '9876543212',
            role: 'user',
            status: 'inactive',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            incidentCount: 0,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleUserAction = (userId, action) => {
    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User`,
      `Are you sure you want to ${actionText} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1), 
          onPress: () => processUserAction(userId, action),
          style: action === 'delete' ? 'destructive' : 'default'
        }
      ]
    );
  };

  const processUserAction = async (userId, action) => {
    setProcessingUser(userId);
    try {
      const token = await AsyncStorage.getItem('token');
      
      let response;
      if (action === 'delete') {
        response = await fetch(`${API_BASE_URL}/api/admin/remove-user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/admin/update-user-status/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: action === 'activate' ? 'active' : 'inactive' 
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || `User ${action}d successfully`,
        });
        
        if (action === 'delete') {
          setUsers(prev => prev.filter(user => user._id !== userId));
        } else {
          setUsers(prev => 
            prev.map(user => 
              user._id === userId 
                ? { ...user, status: action === 'activate' ? 'active' : 'inactive' }
                : user
            )
          );
        }
      } else {
        const errorData = await response.json();
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorData.message || `Failed to ${action} user`,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#27ae60',
      inactive: '#e74c3c',
      pending: '#f39c12',
    };
    return colors[status] || '#95a5a6';
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = searchQuery === '' || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderUserCard = (user) => (
    <View key={user._id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userMobile}>{user.mobile}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
            <Text style={styles.statusText}>{user.status?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userContent}>
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.incidentCount || 0}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
            </Text>
            <Text style={styles.statLabel}>Last Login</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDate(user.createdAt)}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {user.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deactivateButton]}
              onPress={() => handleUserAction(user._id, 'deactivate')}
              disabled={processingUser === user._id}
            >
              <Icon name="block" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>
                {processingUser === user._id ? 'Processing...' : 'Deactivate'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleUserAction(user._id, 'activate')}
              disabled={processingUser === user._id}
            >
              <Icon name="check-circle" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>
                {processingUser === user._id ? 'Processing...' : 'Activate'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleUserAction(user._id, 'delete')}
            disabled={processingUser === user._id}
          >
            <Icon name="delete" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>
              {processingUser === user._id ? 'Processing...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
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
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Icon name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'inactive').length}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {users.reduce((sum, user) => sum + (user.incidentCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
      </View>

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

      {/* Users List */}
      <View style={styles.content}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'No users have been registered yet'
                : `No ${filter} users found`
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Users' : `${filters.find(f => f.key === filter)?.label} Users`} ({filteredUsers.length})
            </Text>
            {filteredUsers.map(renderUserCard)}
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
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
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
  userContent: {
    padding: 16,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activateButton: {
    backgroundColor: '#27ae60',
  },
  deactivateButton: {
    backgroundColor: '#e74c3c',
  },
  deleteButton: {
    backgroundColor: '#8e44ad',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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

export default UserManagementScreen;
