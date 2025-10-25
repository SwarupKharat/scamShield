const Incident = require('../models/incident.model.js');
const CommunityPost = require('../models/communityPost.model.js');
const locationService = require('../services/locationService.js');

// Get map data for incidents
const getIncidentMapData = async (req, res) => {
    try {
        const incidents = await Incident.find({ 
            status: { $ne: 'dismissed' },
            coordinates: { $exists: true }
        }).select('title description location pincode coordinates severity createdAt scamType');

        // Group incidents by pincode for heatmap
        const heatmapData = {};
        const markerData = [];

        incidents.forEach(incident => {
            const pincode = incident.pincode;
            const coords = incident.coordinates;

            if (coords && coords.latitude && coords.longitude) {
                // Add to heatmap data
                if (!heatmapData[pincode]) {
                    heatmapData[pincode] = {
                        pincode,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        count: 0,
                        severity: { low: 0, medium: 0, high: 0, critical: 0 }
                    };
                }
                heatmapData[pincode].count++;
                heatmapData[pincode].severity[incident.severity]++;

                // Add to marker data
                markerData.push({
                    id: incident._id,
                    title: incident.title,
                    description: incident.description,
                    location: incident.location,
                    pincode: incident.pincode,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    severity: incident.severity,
                    createdAt: incident.createdAt,
                    scamType: incident.scamType || 'general'
                });
            }
        });

        res.json({
            success: true,
            data: {
                heatmapData: Object.values(heatmapData),
                markerData,
                totalIncidents: incidents.length
            }
        });
    } catch (error) {
        console.error('Error fetching incident map data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incident map data',
            error: error.message
        });
    }
};

// Get map data for community posts
const getCommunityMapData = async (req, res) => {
    try {
        const posts = await CommunityPost.find({ 
            status: 'active',
            coordinates: { $exists: true }
        }).select('title content region pincode coordinates scamType createdAt');

        // Group posts by pincode for heatmap
        const heatmapData = {};
        const markerData = [];

        posts.forEach(post => {
            const pincode = post.pincode;
            const coords = post.coordinates;

            if (coords && coords.latitude && coords.longitude) {
                // Add to heatmap data
                if (!heatmapData[pincode]) {
                    heatmapData[pincode] = {
                        pincode,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        count: 0,
                        scamTypes: {}
                    };
                }
                heatmapData[pincode].count++;
                heatmapData[pincode].scamTypes[post.scamType] = 
                    (heatmapData[pincode].scamTypes[post.scamType] || 0) + 1;

                // Add to marker data
                markerData.push({
                    id: post._id,
                    title: post.title,
                    content: post.content,
                    region: post.region,
                    pincode: post.pincode,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    scamType: post.scamType,
                    createdAt: post.createdAt
                });
            }
        });

        res.json({
            success: true,
            data: {
                heatmapData: Object.values(heatmapData),
                markerData,
                totalPosts: posts.length
            }
        });
    } catch (error) {
        console.error('Error fetching community map data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch community map data',
            error: error.message
        });
    }
};

// Get combined map data (incidents + community posts)
const getCombinedMapData = async (req, res) => {
    try {
        const [incidents, posts] = await Promise.all([
            Incident.find({ 
                status: { $ne: 'dismissed' },
                coordinates: { $exists: true }
            }).select('title description location pincode coordinates severity createdAt scamType'),
            CommunityPost.find({ 
                status: 'active',
                coordinates: { $exists: true }
            }).select('title content region pincode coordinates scamType createdAt')
        ]);

        // Combine data
        const heatmapData = {};
        const incidentMarkers = [];
        const postMarkers = [];

        // Process incidents
        incidents.forEach(incident => {
            const pincode = incident.pincode;
            const coords = incident.coordinates;

            if (coords && coords.latitude && coords.longitude) {
                if (!heatmapData[pincode]) {
                    heatmapData[pincode] = {
                        pincode,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        incidentCount: 0,
                        postCount: 0,
                        severity: { low: 0, medium: 0, high: 0, critical: 0 },
                        scamTypes: {}
                    };
                }
                heatmapData[pincode].incidentCount++;
                heatmapData[pincode].severity[incident.severity]++;

                incidentMarkers.push({
                    id: incident._id,
                    type: 'incident',
                    title: incident.title,
                    description: incident.description,
                    location: incident.location,
                    pincode: incident.pincode,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    severity: incident.severity,
                    createdAt: incident.createdAt,
                    scamType: incident.scamType || 'general'
                });
            }
        });

        // Process community posts
        posts.forEach(post => {
            const pincode = post.pincode;
            const coords = post.coordinates;

            if (coords && coords.latitude && coords.longitude) {
                if (!heatmapData[pincode]) {
                    heatmapData[pincode] = {
                        pincode,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        incidentCount: 0,
                        postCount: 0,
                        severity: { low: 0, medium: 0, high: 0, critical: 0 },
                        scamTypes: {}
                    };
                }
                heatmapData[pincode].postCount++;
                heatmapData[pincode].scamTypes[post.scamType] = 
                    (heatmapData[pincode].scamTypes[post.scamType] || 0) + 1;

                postMarkers.push({
                    id: post._id,
                    type: 'post',
                    title: post.title,
                    content: post.content,
                    region: post.region,
                    pincode: post.pincode,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    scamType: post.scamType,
                    createdAt: post.createdAt
                });
            }
        });

        res.json({
            success: true,
            data: {
                heatmapData: Object.values(heatmapData),
                incidentMarkers,
                postMarkers,
                totalIncidents: incidents.length,
                totalPosts: posts.length
            }
        });
    } catch (error) {
        console.error('Error fetching combined map data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch combined map data',
            error: error.message
        });
    }
};

// Get scam hotspots (areas with high scam activity)
const getScamHotspots = async (req, res) => {
    try {
        const { radius = 10, limit = 20 } = req.query;

        const [incidents, posts] = await Promise.all([
            Incident.find({ 
                status: { $ne: 'dismissed' },
                coordinates: { $exists: true }
            }),
            CommunityPost.find({ 
                status: 'active',
                coordinates: { $exists: true }
            })
        ]);

        // Group by pincode and calculate activity score
        const hotspotData = {};

        incidents.forEach(incident => {
            const pincode = incident.pincode;
            if (!hotspotData[pincode]) {
                hotspotData[pincode] = {
                    pincode,
                    coordinates: incident.coordinates,
                    incidentCount: 0,
                    postCount: 0,
                    severityScore: 0,
                    scamTypes: {},
                    activityScore: 0
                };
            }
            hotspotData[pincode].incidentCount++;
            
            // Calculate severity score (critical=4, high=3, medium=2, low=1)
            const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
            hotspotData[pincode].severityScore += severityScores[incident.severity] || 1;
        });

        posts.forEach(post => {
            const pincode = post.pincode;
            if (!hotspotData[pincode]) {
                hotspotData[pincode] = {
                    pincode,
                    coordinates: post.coordinates,
                    incidentCount: 0,
                    postCount: 0,
                    severityScore: 0,
                    scamTypes: {},
                    activityScore: 0
                };
            }
            hotspotData[pincode].postCount++;
            hotspotData[pincode].scamTypes[post.scamType] = 
                (hotspotData[pincode].scamTypes[post.scamType] || 0) + 1;
        });

        // Calculate activity score and sort
        const hotspots = Object.values(hotspotData).map(hotspot => {
            hotspot.activityScore = 
                (hotspot.incidentCount * 2) + // Incidents weighted more
                hotspot.postCount + 
                (hotspot.severityScore / Math.max(hotspot.incidentCount, 1)); // Average severity
            
            return hotspot;
        }).sort((a, b) => b.activityScore - a.activityScore).slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                hotspots,
                totalHotspots: hotspots.length
            }
        });
    } catch (error) {
        console.error('Error fetching scam hotspots:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scam hotspots',
            error: error.message
        });
    }
};

module.exports = {
    getIncidentMapData,
    getCommunityMapData,
    getCombinedMapData,
    getScamHotspots
};
