import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const MapScreen = ({ navigation }) => {
  const [mapData, setMapData] = useState({
    incidents: [],
    posts: [],
    hotspots: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [region, setRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching map data from backend...');
      
      const [incidentsRes, postsRes, hotspotsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/map/incidents`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/map/community`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/map/hotspots`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('Map data responses:', {
        incidents: incidentsRes.status,
        posts: postsRes.status,
        hotspots: hotspotsRes.status
      });

      const incidentsData = await incidentsRes.json();
      const postsData = await postsRes.json();
      const hotspotsData = await hotspotsRes.json();

      if (incidentsData.success && postsData.success && hotspotsData.success) {
        setMapData({
          incidents: incidentsData.data || [],
          posts: postsData.data || [],
          hotspots: hotspotsData.data || [],
        });
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load map data',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMapData();
    setRefreshing(false);
  };

  const getMarkerColor = (type, severity) => {
    if (type === 'incident') {
      const colors = {
        critical: '#e74c3c',
        high: '#f39c12',
        medium: '#f1c40f',
        low: '#2ecc71'
      };
      return colors[severity] || '#95a5a6';
    } else {
      return '#3498db';
    }
  };

  const getMarkerSize = (count) => {
    if (count >= 10) return 20;
    if (count >= 5) return 15;
    if (count >= 2) return 10;
    return 5;
  };

  const filteredIncidents = mapData.incidents.filter(incident => {
    if (selectedType !== 'all' && selectedType !== 'incident') return false;
    if (selectedSeverity !== 'all' && incident.severity !== selectedSeverity) return false;
    return true;
  });

  const filteredPosts = mapData.posts.filter(post => {
    if (selectedType !== 'all' && selectedType !== 'post') return false;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scam Map</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterText, selectedType === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'incident' && styles.filterButtonActive]}
            onPress={() => setSelectedType('incident')}
          >
            <Text style={[styles.filterText, selectedType === 'incident' && styles.filterTextActive]}>
              Incidents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'post' && styles.filterButtonActive]}
            onPress={() => setSelectedType('post')}
          >
            <Text style={[styles.filterText, selectedType === 'post' && styles.filterTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {(selectedType === 'all' || selectedType === 'incident') && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.severityFilters}>
            <TouchableOpacity
              style={[styles.severityButton, selectedSeverity === 'all' && styles.severityButtonActive]}
              onPress={() => setSelectedSeverity('all')}
            >
              <Text style={[styles.severityText, selectedSeverity === 'all' && styles.severityTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {['critical', 'high', 'medium', 'low'].map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[styles.severityButton, selectedSeverity === severity && styles.severityButtonActive]}
                onPress={() => setSelectedSeverity(severity)}
              >
                <Text style={[styles.severityText, selectedSeverity === severity && styles.severityTextActive]}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Hotspots */}
        {mapData.hotspots.map((hotspot, index) => (
          <Circle
            key={`hotspot-${index}`}
            center={{
              latitude: hotspot.latitude,
              longitude: hotspot.longitude,
            }}
            radius={getMarkerSize(hotspot.count || hotspot.incidentCount + hotspot.postCount) * 1000}
            fillColor="rgba(231, 76, 60, 0.3)"
            strokeColor="rgba(231, 76, 60, 0.8)"
            strokeWidth={2}
          />
        ))}

        {/* Incident Markers */}
        {filteredIncidents.map((incident) => (
          <Marker
            key={`incident-${incident.id}`}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.title}
            description={`${incident.location} - ${incident.severity}`}
            pinColor={getMarkerColor('incident', incident.severity)}
          />
        ))}

        {/* Post Markers */}
        {filteredPosts.map((post) => (
          <Marker
            key={`post-${post.id}`}
            coordinate={{
              latitude: post.latitude,
              longitude: post.longitude,
            }}
            title={post.title}
            description={`${post.region} - ${post.scamType}`}
            pinColor={getMarkerColor('post')}
          />
        ))}
      </MapView>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredIncidents.length}</Text>
          <Text style={styles.statLabel}>Incidents</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredPosts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mapData.hotspots.length}</Text>
          <Text style={styles.statLabel}>Hotspots</Text>
        </View>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
            <Text style={styles.legendText}>Critical</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f1c40f' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
            <Text style={styles.legendText}>Posts</Text>
          </View>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    fontSize: 18,
    color: '#3498db',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  severityFilters: {
    marginTop: 10,
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 3,
    backgroundColor: 'white',
  },
  severityButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  severityText: {
    fontSize: 12,
    color: '#666',
  },
  severityTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  legendContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MapScreen;
