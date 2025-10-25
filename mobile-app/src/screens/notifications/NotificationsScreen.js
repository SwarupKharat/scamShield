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
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const filters = [
    { key: 'all', label: 'All', color: '#95a5a6' },
    { key: 'unread', label: 'Unread', color: '#e74c3c' },
    { key: 'incidents', label: 'Incidents', color: '#f39c12' },
    { key: 'system', label: 'System', color: '#3498db' },
  ];

  useEffect(() => {
    fetchNotifications();
    
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
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching notifications...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Notifications data received:', data);
        setNotifications(data.notifications || []);
      } else {
        console.log('Failed to fetch notifications:', response.status);
        // Mock data for demonstration
        setNotifications([
          {
            _id: '1',
            title: 'New Incident Reported',
            message: 'A new scam incident has been reported in your area',
            type: 'incident',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            priority: 'high',
          },
          {
            _id: '2',
            title: 'Incident Status Update',
            message: 'Your reported incident has been moved to "Under Review"',
            type: 'incident',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            priority: 'medium',
          },
          {
            _id: '3',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
            type: 'system',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            priority: 'low',
          },
          {
            _id: '4',
            title: 'Welcome to Prabhodhanyaya',
            message: 'Thank you for joining our scam prevention community',
            type: 'system',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            priority: 'low',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/mark-notification-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/clear-notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'All notifications marked as read',
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            setNotifications(prev => 
              prev.filter(notif => notif._id !== notificationId)
            );
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'Notification has been deleted',
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const getNotificationIcon = (type, priority) => {
    const icons = {
      incident: 'report-problem',
      system: 'info',
      security: 'security',
      update: 'update',
    };
    
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type, priority) => {
    const colors = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#95a5a6',
    };
    
    return colors[priority] || '#3498db';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'incidents') return notification.type === 'incident';
    if (filter === 'system') return notification.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = (notification, index) => (
    <Animated.View
      key={notification._id}
      style={[
        styles.notificationCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.notificationContent,
          !notification.read && styles.unreadNotification
        ]}
        onPress={() => {
          if (!notification.read) {
            markAsRead(notification._id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationLeft}>
          <View style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(notification.type, notification.priority) }
          ]}>
            <Icon 
              name={getNotificationIcon(notification.type, notification.priority)} 
              size={20} 
              color="#fff" 
            />
          </View>
          <View style={styles.notificationText}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.unreadText
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.notificationRight}>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(notification._id)}
          >
            <Icon name="delete" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Icon name="done-all" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'incident').length}
          </Text>
          <Text style={styles.statLabel}>Incidents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {notifications.filter(n => n.type === 'system').length}
          </Text>
          <Text style={styles.statLabel}>System</Text>
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

      {/* Notifications List */}
      <View style={styles.content}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'You have no notifications yet'
                : `No ${filter} notifications found`
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Notifications' : `${filters.find(f => f.key === filter)?.label} Notifications`} ({filteredNotifications.length})
            </Text>
            {filteredNotifications.map((notification, index) => 
              renderNotification(notification, index)
            )}
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
  markAllButton: {
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
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationRight: {
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  deleteButton: {
    padding: 4,
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

export default NotificationsScreen;
