import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ScamMap = ({ mapType = 'combined' }) => {
  const [mapData, setMapData] = useState({
    heatmapData: [],
    incidentMarkers: [],
    postMarkers: [],
    totalIncidents: 0,
    totalPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // India center coordinates
  const indiaCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  useEffect(() => {
    fetchMapData();
  }, [mapType]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const endpoint = mapType === 'combined' ? '/api/map/combined' : 
                      mapType === 'incidents' ? '/api/map/incidents' : 
                      '/api/map/community';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }

      const data = await response.json();
      if (data.success) {
        setMapData(data.data);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (type, severity) => {
    if (type === 'incident') {
      const colors = {
        critical: '#dc2626', // red
        high: '#ea580c',     // orange
        medium: '#d97706',   // amber
        low: '#16a34a'       // green
      };
      return colors[severity] || '#6b7280';
    } else {
      return '#3b82f6'; // blue for posts
    }
  };

  const getMarkerSize = (count) => {
    if (count >= 10) return 15;
    if (count >= 5) return 12;
    if (count >= 2) return 9;
    return 6;
  };

  const filteredIncidentMarkers = mapData.incidentMarkers?.filter(marker => {
    if (selectedType !== 'all' && selectedType !== 'incident') return false;
    if (selectedSeverity !== 'all' && marker.severity !== selectedSeverity) return false;
    return true;
  }) || [];

  const filteredPostMarkers = mapData.postMarkers?.filter(marker => {
    if (selectedType !== 'all' && selectedType !== 'post') return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Map Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="incident">Incidents</option>
            <option value="post">Community Posts</option>
          </select>
        </div>

        {selectedType === 'all' || selectedType === 'incident' ? (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        ) : null}

        <div className="text-sm text-gray-600">
          Showing {filteredIncidentMarkers.length + filteredPostMarkers.length} locations
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={indiaCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap Circles */}
          {mapData.heatmapData?.map((heatmap, index) => (
            <CircleMarker
              key={`heatmap-${index}`}
              center={[heatmap.latitude, heatmap.longitude]}
              radius={getMarkerSize(heatmap.count || heatmap.incidentCount + heatmap.postCount)}
              pathOptions={{
                fillColor: '#ef4444',
                color: '#dc2626',
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.3
              }}
            >
              <Tooltip>
                <div className="text-sm">
                  <div className="font-semibold">Pincode: {heatmap.pincode}</div>
                  <div>Total Reports: {heatmap.count || heatmap.incidentCount + heatmap.postCount}</div>
                  {heatmap.incidentCount > 0 && <div>Incidents: {heatmap.incidentCount}</div>}
                  {heatmap.postCount > 0 && <div>Posts: {heatmap.postCount}</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Incident Markers */}
          {filteredIncidentMarkers.map((marker) => (
            <Marker
              key={`incident-${marker.id}`}
              position={[marker.latitude, marker.longitude]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background-color: ${getMarkerColor('incident', marker.severity)};
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-red-600 mb-2">{marker.title}</div>
                  <div className="mb-2">{marker.description}</div>
                  <div className="text-gray-600">
                    <div><strong>Location:</strong> {marker.location}</div>
                    <div><strong>Pincode:</strong> {marker.pincode}</div>
                    <div><strong>Severity:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        marker.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        marker.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        marker.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {marker.severity}
                      </span>
                    </div>
                    <div><strong>Date:</strong> {new Date(marker.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Community Post Markers */}
          {filteredPostMarkers.map((marker) => (
            <Marker
              key={`post-${marker.id}`}
              position={[marker.latitude, marker.longitude]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background-color: ${getMarkerColor('post')};
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-blue-600 mb-2">{marker.title}</div>
                  <div className="mb-2">{marker.content.substring(0, 100)}...</div>
                  <div className="text-gray-600">
                    <div><strong>Region:</strong> {marker.region}</div>
                    <div><strong>Pincode:</strong> {marker.pincode}</div>
                    <div><strong>Scam Type:</strong> 
                      <span className="ml-1 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {marker.scamType}
                      </span>
                    </div>
                    <div><strong>Date:</strong> {new Date(marker.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Incident Reports</h4>
          <div className="text-2xl font-bold text-red-600 mb-2">{mapData.totalIncidents}</div>
          <div className="text-sm text-gray-600">
            {filteredIncidentMarkers.length} visible on map
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Community Posts</h4>
          <div className="text-2xl font-bold text-blue-600 mb-2">{mapData.totalPosts}</div>
          <div className="text-sm text-gray-600">
            {filteredPostMarkers.length} visible on map
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Scam Hotspots</h4>
          <div className="text-2xl font-bold text-orange-600 mb-2">{mapData.heatmapData?.length || 0}</div>
          <div className="text-sm text-gray-600">
            Areas with high activity
          </div>
        </div>
      </div>

      {/* Recent Incidents List */}
      {filteredIncidentMarkers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {filteredIncidentMarkers.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  incident.severity === 'critical' ? 'bg-red-500' :
                  incident.severity === 'high' ? 'bg-orange-500' :
                  incident.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{incident.title}</h4>
                  <p className="text-sm text-gray-600">{incident.location}, {incident.pincode}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Community Posts */}
      {filteredPostMarkers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Community Posts</h3>
          <div className="space-y-3">
            {filteredPostMarkers.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <p className="text-sm text-gray-600">{post.region}, {post.pincode}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Community Posts</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-30"></div>
          <span>Scam Hotspots</span>
        </div>
      </div>
    </div>
  );
};

export default ScamMap;