import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalIncidents: 0,
    totalUsers: 0,
    totalScammers: 0,
    incidentsByStatus: {},
    incidentsBySeverity: {},
    monthlyTrends: [],
    topScamTypes: [],
    resolutionRate: 0,
    averageResolutionTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchAnalyticsData();
    
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
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching analytics data...');
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Analytics data received:', statsData);
        
        if (statsData.success && statsData.stats) {
          setAnalyticsData(prev => ({
            ...prev,
            totalIncidents: statsData.stats.totalIncidents || 0,
            totalUsers: statsData.stats.totalUsers || 0,
            resolutionRate: statsData.stats.resolutionRate || 0,
            incidentsByStatus: {
              reported: statsData.stats.openIncidents || 0,
              under_review: statsData.stats.inProgressIncidents || 0,
              resolved: statsData.stats.resolvedIncidents || 0,
            }
          }));
        }
      }

      // Fetch scammer statistics
      try {
        const scammersResponse = await fetch(`${API_BASE_URL}/api/scammers/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (scammersResponse.ok) {
          const scammerData = await scammersResponse.json();
          setAnalyticsData(prev => ({
            ...prev,
            totalScammers: scammerData.totalScammers || 0,
          }));
        }
      } catch (scammerError) {
        console.log('Could not fetch scammer stats:', scammerError.message);
      }

      // Mock data for demonstration
      setAnalyticsData(prev => ({
        ...prev,
        incidentsBySeverity: {
          low: 15,
          medium: 25,
          high: 12,
          critical: 8,
        },
        monthlyTrends: [
          { month: 'Jan', incidents: 45 },
          { month: 'Feb', incidents: 52 },
          { month: 'Mar', incidents: 38 },
          { month: 'Apr', incidents: 61 },
          { month: 'May', incidents: 48 },
          { month: 'Jun', incidents: 55 },
        ],
        topScamTypes: [
          { type: 'Phishing', count: 25 },
          { type: 'Fake Calls', count: 18 },
          { type: 'UPI Fraud', count: 15 },
          { type: 'Investment Scam', count: 12 },
          { type: 'Job Fraud', count: 8 },
        ],
        averageResolutionTime: 3.2,
      }));
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load analytics data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const periodOptions = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
  ];

  const renderMetricCard = (title, value, icon, color, subtitle) => (
    <Animated.View 
      style={[
        styles.metricCard,
        { 
          borderLeftColor: color,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.metricContent}>
        <View style={styles.metricInfo}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricLabel}>{title}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
      </View>
    </Animated.View>
  );

  const renderChartCard = (title, children) => (
    <Animated.View
      style={[
        styles.chartCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </Animated.View>
  );

  const renderStatusChart = () => {
    const total = Object.values(analyticsData.incidentsByStatus).reduce((sum, count) => sum + count, 0);
    const statuses = [
      { key: 'reported', label: 'Reported', color: '#f39c12' },
      { key: 'under_review', label: 'Under Review', color: '#3498db' },
      { key: 'resolved', label: 'Resolved', color: '#27ae60' },
    ];

    return (
      <View style={styles.chartContainer}>
        {statuses.map((status) => {
          const count = analyticsData.incidentsByStatus[status.key] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <View key={status.key} style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={styles.statusLabel}>{status.label}</Text>
              </View>
              <View style={styles.statusStats}>
                <Text style={styles.statusCount}>{count}</Text>
                <Text style={styles.statusPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSeverityChart = () => {
    const severities = [
      { key: 'low', label: 'Low', color: '#27ae60' },
      { key: 'medium', label: 'Medium', color: '#f39c12' },
      { key: 'high', label: 'High', color: '#e74c3c' },
      { key: 'critical', label: 'Critical', color: '#8e44ad' },
    ];

    return (
      <View style={styles.chartContainer}>
        {severities.map((severity) => {
          const count = analyticsData.incidentsBySeverity[severity.key] || 0;
          
          return (
            <View key={severity.key} style={styles.severityRow}>
              <View style={styles.severityInfo}>
                <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
                <Text style={styles.severityLabel}>{severity.label}</Text>
              </View>
              <Text style={styles.severityCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTopScamTypes = () => (
    <View style={styles.chartContainer}>
      {analyticsData.topScamTypes.map((scam, index) => (
        <View key={index} style={styles.scamRow}>
          <View style={styles.scamInfo}>
            <Text style={styles.scamRank}>#{index + 1}</Text>
            <Text style={styles.scamType}>{scam.type}</Text>
          </View>
          <Text style={styles.scamCount}>{scam.count}</Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
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
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Icon name="file-download" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Incidents',
            analyticsData.totalIncidents,
            'report-problem',
            '#e74c3c'
          )}
          {renderMetricCard(
            'Total Users',
            analyticsData.totalUsers,
            'people',
            '#2ecc71'
          )}
          {renderMetricCard(
            'Resolution Rate',
            `${analyticsData.resolutionRate}%`,
            'trending-up',
            '#3498db',
            'Avg: 3.2 days'
          )}
          {renderMetricCard(
            'Scammers',
            analyticsData.totalScammers,
            'security',
            '#9b59b6'
          )}
        </View>
      </View>

      {/* Charts */}
      <View style={styles.chartsContainer}>
        {renderChartCard('Incidents by Status', renderStatusChart())}
        {renderChartCard('Incidents by Severity', renderSeverityChart())}
        {renderChartCard('Top Scam Types', renderTopScamTypes())}
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
  exportButton: {
    padding: 8,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  periodButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
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
  metricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartsContainer: {
    padding: 20,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#000',
  },
  statusStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  statusPercentage: {
    fontSize: 12,
    color: '#666',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  severityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  severityLabel: {
    fontSize: 14,
    color: '#000',
  },
  severityCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  scamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scamRank: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 8,
  },
  scamType: {
    fontSize: 14,
    color: '#000',
  },
  scamCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default AnalyticsScreen;
