const axios = require('axios');

// Service to convert pincode to coordinates
class LocationService {
    constructor() {
        this.pincodeCache = new Map();
    }

    // Convert pincode to coordinates using a geocoding service
    async getCoordinatesFromPincode(pincode) {
        try {
            // Check cache first
            if (this.pincodeCache.has(pincode)) {
                return this.pincodeCache.get(pincode);
            }

            // Use a free geocoding service (you can replace with Google Maps API or other services)
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
            
            if (response.data && response.data[0] && response.data[0].Status === 'Success') {
                const postOffice = response.data[0].PostOffice[0];
                
                // For Indian pincodes, we'll use approximate coordinates based on state/district
                const coordinates = this.getApproximateCoordinates(postOffice.State, postOffice.District);
                
                // Cache the result
                this.pincodeCache.set(pincode, coordinates);
                
                return coordinates;
            } else {
                // Fallback to default coordinates (Delhi)
                const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
                this.pincodeCache.set(pincode, defaultCoords);
                return defaultCoords;
            }
        } catch (error) {
            console.error('Error fetching coordinates for pincode:', pincode, error);
            // Return default coordinates (Delhi)
            const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
            this.pincodeCache.set(pincode, defaultCoords);
            return defaultCoords;
        }
    }

    // Approximate coordinates for major Indian cities/states
    getApproximateCoordinates(state, district) {
        const stateCoordinates = {
            'Delhi': { latitude: 28.6139, longitude: 77.2090 },
            'Maharashtra': { latitude: 19.0760, longitude: 72.8777 },
            'Karnataka': { latitude: 12.9716, longitude: 77.5946 },
            'Tamil Nadu': { latitude: 13.0827, longitude: 80.2707 },
            'West Bengal': { latitude: 22.5726, longitude: 88.3639 },
            'Gujarat': { latitude: 23.0225, longitude: 72.5714 },
            'Rajasthan': { latitude: 26.9124, longitude: 75.7873 },
            'Uttar Pradesh': { latitude: 26.8467, longitude: 80.9462 },
            'Bihar': { latitude: 25.5941, longitude: 85.1376 },
            'Madhya Pradesh': { latitude: 22.9734, longitude: 78.6569 },
            'Punjab': { latitude: 30.7333, longitude: 76.7794 },
            'Haryana': { latitude: 29.0588, longitude: 76.0856 },
            'Kerala': { latitude: 10.8505, longitude: 76.2711 },
            'Odisha': { latitude: 20.2961, longitude: 85.8245 },
            'Assam': { latitude: 26.2006, longitude: 92.9376 },
            'Jharkhand': { latitude: 23.6102, longitude: 85.2799 },
            'Chhattisgarh': { latitude: 21.2787, longitude: 81.8661 },
            'Himachal Pradesh': { latitude: 31.1048, longitude: 77.1734 },
            'Uttarakhand': { latitude: 30.0668, longitude: 79.0193 },
            'Jammu and Kashmir': { latitude: 34.0837, longitude: 74.7973 },
            'Goa': { latitude: 15.2993, longitude: 74.1240 },
            'Tripura': { latitude: 23.9408, longitude: 91.9882 },
            'Manipur': { latitude: 24.6637, longitude: 93.9063 },
            'Meghalaya': { latitude: 25.4670, longitude: 91.3662 },
            'Mizoram': { latitude: 23.1645, longitude: 92.9376 },
            'Nagaland': { latitude: 26.1584, longitude: 94.5624 },
            'Arunachal Pradesh': { latitude: 28.2180, longitude: 94.7278 },
            'Sikkim': { latitude: 27.5330, longitude: 88.5122 },
            'Telangana': { latitude: 17.3850, longitude: 78.4867 },
            'Andhra Pradesh': { latitude: 15.9129, longitude: 79.7400 }
        };

        return stateCoordinates[state] || { latitude: 28.6139, longitude: 77.2090 };
    }

    // Calculate distance between two coordinates (in kilometers)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Get nearby pincodes within a radius
    async getNearbyPincodes(pincode, radiusKm = 10) {
        try {
            const centerCoords = await this.getCoordinatesFromPincode(pincode);
            const nearbyPincodes = [];

            // This is a simplified approach - in production, you'd want to use a proper geospatial database
            // For now, we'll return the same pincode as nearby
            nearbyPincodes.push(pincode);

            return nearbyPincodes;
        } catch (error) {
            console.error('Error getting nearby pincodes:', error);
            return [pincode];
        }
    }
}

module.exports = new LocationService();
