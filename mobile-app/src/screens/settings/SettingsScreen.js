import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const { authUser, authRole } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    darkMode: false,
    autoSync: true,
    biometricAuth: false,
    dataUsage: 'wifi',
    language: 'en',
    privacyMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadSettings();
    
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

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      Toast.show({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Your preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save settings',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleDataUsageChange = () => {
    Alert.alert(
      'Data Usage',
      'Choose your preferred data usage setting',
      [
        { text: 'WiFi Only', onPress: () => saveSettings({ ...settings, dataUsage: 'wifi' }) },
        { text: 'WiFi + Mobile', onPress: () => saveSettings({ ...settings, dataUsage: 'all' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => saveSettings({ ...settings, language: 'en' }) },
        { text: 'Hindi', onPress: () => saveSettings({ ...settings, language: 'hi' }) },
        { text: 'Tamil', onPress: () => saveSettings({ ...settings, language: 'ta' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('appCache');
              Toast.show({
                type: 'success',
                text1: 'Cache Cleared',
                text2: 'All cached data has been removed',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to clear cache',
              });
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleExportData = () => {
    Toast.show({
      type: 'info',
      text1: 'Export Data',
      text2: 'Data export feature will be available soon',
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            Toast.show({
              type: 'error',
              text1: 'Account Deletion',
              text2: 'Please contact support to delete your account',
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive alerts for new incidents and updates',
          type: 'switch',
          icon: 'notifications',
          color: '#3498db',
        },
        {
          key: 'locationTracking',
          title: 'Location Tracking',
          subtitle: 'Allow app to track your location for better services',
          type: 'switch',
          icon: 'location-on',
          color: '#2ecc71',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          key: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          type: 'switch',
          icon: 'dark-mode',
          color: '#34495e',
        },
        {
          key: 'privacyMode',
          title: 'Privacy Mode',
          subtitle: 'Hide sensitive information in screenshots',
          type: 'switch',
          icon: 'security',
          color: '#9b59b6',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          key: 'biometricAuth',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face recognition',
          type: 'switch',
          icon: 'fingerprint',
          color: '#e74c3c',
        },
        {
          key: 'autoSync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data when connected',
          type: 'switch',
          icon: 'sync',
          color: '#f39c12',
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          key: 'dataUsage',
          title: 'Data Usage',
          subtitle: settings.dataUsage === 'wifi' ? 'WiFi Only' : 'WiFi + Mobile',
          type: 'action',
          icon: 'data-usage',
          color: '#27ae60',
          onPress: handleDataUsageChange,
        },
        {
          key: 'language',
          title: 'Language',
          subtitle: settings.language === 'en' ? 'English' : 'Other',
          type: 'action',
          icon: 'language',
          color: '#8e44ad',
          onPress: handleLanguageChange,
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          key: 'clearCache',
          title: 'Clear Cache',
          subtitle: 'Remove temporary files and data',
          type: 'action',
          icon: 'delete-sweep',
          color: '#e67e22',
          onPress: handleClearCache,
        },
        {
          key: 'exportData',
          title: 'Export Data',
          subtitle: 'Download your data and reports',
          type: 'action',
          icon: 'file-download',
          color: '#16a085',
          onPress: handleExportData,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          key: 'deleteAccount',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          type: 'action',
          icon: 'delete-forever',
          color: '#e74c3c',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item, sectionIndex, itemIndex) => (
    <Animated.View
      key={item.key}
      style={[
        styles.settingItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.settingItemContent}
        onPress={item.onPress || (() => handleToggle(item.key))}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={20} color="#fff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {item.type === 'switch' ? (
            <Switch
              value={settings[item.key]}
              onValueChange={() => handleToggle(item.key)}
              trackColor={{ false: '#ddd', true: item.color }}
              thumbColor={settings[item.key] ? '#fff' : '#f4f3f4'}
            />
          ) : (
            <Icon name="chevron-right" size={24} color="#666" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
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
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.resetButton}>
            <Icon name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {authUser?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {authUser?.firstName} {authUser?.lastName}
            </Text>
            <Text style={styles.userRole}>{authRole?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      <View style={styles.settingsContainer}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => 
                renderSettingItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.appInfoTitle}>Prabhodhanyaya</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoDescription}>
          A comprehensive scam prevention platform designed to protect users from various types of fraud and scams.
        </Text>
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
  resetButton: {
    padding: 8,
  },
  userSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  settingsContainer: {
    paddingHorizontal: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  settingItemRight: {
    marginLeft: 12,
  },
  appInfoSection: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  appInfoDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SettingsScreen;
