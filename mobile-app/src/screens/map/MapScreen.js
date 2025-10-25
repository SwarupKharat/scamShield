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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://192.168.1.6:5000'; // Use your IP

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
    latitude: 20.5937, // Center of India
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
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Making API requests...');

      const [incidentsRes, postsRes, hotspotsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/map/incidents`, { headers }),
        fetch(`${API_BASE_URL}/api/map/community`, { headers }),
        fetch(`${API_BASE_URL}/api/map/hotspots`, { headers })
      ]);

      console.log('Map data responses:', {
        incidents: incidentsRes.status,
        posts: postsRes.status,
        hotspots: hotspotsRes.status
      });

      const incidentsData = await incidentsRes.json();
      const postsData = await postsRes.json();
      const hotspotsData = await hotspotsRes.json();

      console.log('Parsed data:', {
        incidents: incidentsData,
        posts: postsData,
        hotspots: hotspotsData
      });

      // Safely extract arrays from responses
      const incidents = Array.isArray(incidentsData?.data) 
        ? incidentsData.data 
        : Array.isArray(incidentsData) 
        ? incidentsData 
        : [];

      const posts = Array.isArray(postsData?.data) 
        ? postsData.data 
        : Array.isArray(postsData) 
        ? postsData 
        : [];

      const hotspots = Array.isArray(hotspotsData?.data) 
        ? hotspotsData.data 
        : Array.isArray(hotspotsData) 
        ? hotspotsData 
        : [];

      console.log('Extracted arrays:', {
        incidentsCount: incidents.length,
        postsCount: posts.length,
        hotspotsCount: hotspots.length
      });

      setMapData({
        incidents,
        posts,
        hotspots,
      });

      // If we have data, center map on first incident/post
      if (incidents.length > 0 || posts.length > 0) {
        const firstItem = incidents[0] || posts[0];
        if (firstItem && firstItem.latitude && firstItem.longitude) {
          setRegion({
            latitude: firstItem.latitude,
            longitude: firstItem.longitude,
            latitudeDelta: 2,
            longitudeDelta: 2,
          });
        }
      }

    } catch (error) {
      console.error('Error fetching map data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load map data',
      });
      
      // Set empty arrays on error
      setMapData({
        incidents: [],
        posts: [],
        hotspots: [],
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

  const getHotspotRadius = (count) => {
    // Returns radius in meters
    if (count >= 10) return 5000;
    if (count >= 5) return 3000;
    if (count >= 2) return 2000;
    return 1000;
  };

  // Safe filtering with array checks
  const filteredIncidents = Array.isArray(mapData.incidents) 
    ? mapData.incidents.filter(incident => {
        if (selectedType !== 'all' && selectedType !== 'incident') return false;
        if (selectedSeverity !== 'all' && incident.severity !== selectedSeverity) return false;
        // Ensure incident has coordinates
        return incident.latitude && incident.longitude;
      })
    : [];

  const filteredPosts = Array.isArray(mapData.posts)
    ? mapData.posts.filter(post => {
        if (selectedType !== 'all' && selectedType !== 'post') return false;
        // Ensure post has coordinates
        return post.latitude && post.longitude;
      })
    : [];

  const validHotspots = Array.isArray(mapData.hotspots)
    ? mapData.hotspots.filter(hotspot => hotspot.latitude && hotspot.longitude)
    : [];

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
              Incidents ({mapData.incidents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'post' && styles.filterButtonActive]}
            onPress={() => setSelectedType('post')}
          >
            <Text style={[styles.filterText, selectedType === 'post' && styles.filterTextActive]}>
              Posts ({mapData.posts.length})
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
                All Severity
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
        {validHotspots.map((hotspot, index) => (
          <Circle
            key={`hotspot-${index}`}
            center={{
              latitude: parseFloat(hotspot.latitude),
              longitude: parseFloat(hotspot.longitude),
            }}
            radius={getHotspotRadius(hotspot.count || hotspot.incidentCount + hotspot.postCount)}
            fillColor="rgba(231, 76, 60, 0.2)"
            strokeColor="rgba(231, 76, 60, 0.6)"
            strokeWidth={2}
          />
        ))}

        {/* Incident Markers */}
        {filteredIncidents.map((incident, index) => (
          <Marker
            key={`incident-${incident._id || incident.id || index}`}
            coordinate={{
              latitude: parseFloat(incident.latitude),
              longitude: parseFloat(incident.longitude),
            }}
            title={incident.title || 'Incident'}
            description={`${incident.location || incident.region || ''} - ${incident.severity || 'Unknown'}`}
            pinColor={getMarkerColor('incident', incident.severity)}
          />
        ))}

        {/* Post Markers */}
        {filteredPosts.map((post, index) => (
          <Marker
            key={`post-${post._id || post.id || index}`}
            coordinate={{
              latitude: parseFloat(post.latitude),
              longitude: parseFloat(post.longitude),
            }}
            title={post.title || 'Community Post'}
            description={`${post.region || ''} - ${post.scamType || ''}`}
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
          <Text style={styles.statNumber}>{validHotspots.length}</Text>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: 50, // Add top padding for status bar
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    paddingLeft: 5,
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
