const axios = require('axios');

// Service to convert pincode to coordinates using LatLong.ai
class LocationService {
    constructor() {
        this.pincodeCache = new Map();
        // Get your API key from https://apihub.latlong.ai/
        this.apiKey = process.env.LATLONG_API_KEY || 'YOUR_API_KEY_HERE';
        this.baseUrl = 'https://api.latlong.ai';
        
        // Log initialization
        console.log('=== LocationService Initialized ===');
        console.log('Base URL:', this.baseUrl);
        console.log('API Key configured:', this.apiKey !== 'YOUR_API_KEY_HERE' ? 'Yes' : 'No (using default)');
        console.log('===================================');
    }

    // Convert pincode to coordinates using LatLong.ai API
    async getCoordinatesFromPincode(pincode) {
        const startTime = Date.now();
        console.log('\n[getCoordinatesFromPincode] START');
        console.log('├─ Pincode:', pincode);
        console.log('├─ Timestamp:', new Date().toISOString());
        
        try {
            // Check cache first
            if (this.pincodeCache.has(pincode)) {
                console.log('├─ Cache Hit: YES');
                const cached = this.pincodeCache.get(pincode);
                console.log('├─ Cached Data:', JSON.stringify(cached, null, 2));
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
                return cached;
            }
            
            console.log('├─ Cache Hit: NO');
            console.log('├─ Fetching from LatLong.ai API...');

            // Use LatLong.ai API to get coordinates from pincode
            const requestConfig = {
                params: {
                    postalcode: pincode,
                    country: 'IN'
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            };
            
            console.log('├─ Request URL:', `${this.baseUrl}/v2/geocode`);
            console.log('├─ Request Params:', JSON.stringify(requestConfig.params, null, 2));
            
            const response = await axios.get(`${this.baseUrl}/v2/geocode`, requestConfig);
            
            console.log('├─ API Response Status:', response.status);
            console.log('├─ API Response Data:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0];
                const coordinates = {
                    latitude: location.geometry.lat,
                    longitude: location.geometry.lng,
                    address: location.formatted_address || '',
                    state: location.address_components?.state || '',
                    district: location.address_components?.district || '',
                    city: location.address_components?.city || ''
                };

                console.log('├─ Success: Coordinates extracted');
                console.log('├─ Coordinates:', JSON.stringify(coordinates, null, 2));
                console.log('├─ Caching result...');

                // Cache the result
                this.pincodeCache.set(pincode, coordinates);
                console.log('├─ Cache Size:', this.pincodeCache.size);
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');

                return coordinates;
            } else {
                console.log('├─ Warning: No results from API');
                console.log('├─ Falling back to alternative method...');
                const fallback = await this.getFallbackCoordinates(pincode);
                console.log('└─ Total Duration:', (Date.now() - startTime) + 'ms');
                return fallback;
            }
        } catch (error) {
            console.error('├─ ERROR in LatLong.ai API:');
            console.error('├─ Error Type:', error.name);
            console.error('├─ Error Message:', error.message);
            if (error.response) {
                console.error('├─ Response Status:', error.response.status);
                console.error('├─ Response Data:', JSON.stringify(error.response.data, null, 2));
            }
            console.log('├─ Falling back to alternative method...');
            
            const fallback = await this.getFallbackCoordinates(pincode);
            console.log('└─ Total Duration:', (Date.now() - startTime) + 'ms');
            return fallback;
        }
    }

    // Fallback method using postal pincode API
    async getFallbackCoordinates(pincode) {
        const startTime = Date.now();
        console.log('\n[getFallbackCoordinates] START');
        console.log('├─ Pincode:', pincode);
        console.log('├─ Using fallback API: api.postalpincode.in');
        
        try {
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
                timeout: 3000
            });
            
            console.log('├─ Fallback API Response Status:', response.status);
            console.log('├─ Fallback API Response:', JSON.stringify(response.data, null, 2));
            
            if (response.data && response.data[0] && response.data[0].Status === 'Success') {
                const postOffice = response.data[0].PostOffice[0];
                console.log('├─ Post Office Data:', JSON.stringify(postOffice, null, 2));
                
                // Get approximate coordinates based on state/district
                const coordinates = this.getApproximateCoordinates(postOffice.State, postOffice.District);
                coordinates.address = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
                coordinates.state = postOffice.State;
                coordinates.district = postOffice.District;
                
                console.log('├─ Approximate Coordinates:', JSON.stringify(coordinates, null, 2));
                console.log('├─ Caching fallback result...');
                
                // Cache the result
                this.pincodeCache.set(pincode, coordinates);
                console.log('├─ Cache Size:', this.pincodeCache.size);
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
                
                return coordinates;
            } else {
                console.log('├─ Fallback API failed or returned no results');
                console.log('├─ Using default coordinates...');
                const defaultCoords = this.getDefaultCoordinates(pincode);
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
                return defaultCoords;
            }
        } catch (error) {
            console.error('├─ ERROR in Fallback API:');
            console.error('├─ Error Type:', error.name);
            console.error('├─ Error Message:', error.message);
            console.log('├─ Using default coordinates...');
            
            const defaultCoords = this.getDefaultCoordinates(pincode);
            console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
            return defaultCoords;
        }
    }

    // Return default coordinates when all methods fail
    getDefaultCoordinates(pincode) {
        console.log('\n[getDefaultCoordinates] START');
        console.log('├─ Pincode:', pincode);
        
        const defaultCoords = {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'New Delhi, India',
            state: 'Delhi',
            district: 'New Delhi'
        };
        
        console.log('├─ Default Coordinates:', JSON.stringify(defaultCoords, null, 2));
        console.log('├─ Caching default coordinates...');
        
        this.pincodeCache.set(pincode, defaultCoords);
        console.log('└─ Cache Size:', this.pincodeCache.size);
        
        return defaultCoords;
    }

    // Approximate coordinates for major Indian cities/states
    getApproximateCoordinates(state, district) {
        console.log('[getApproximateCoordinates] State:', state, '| District:', district);
        
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

        const coords = stateCoordinates[state] || { latitude: 28.6139, longitude: 77.2090 };
        console.log('└─ Approximate Coords:', JSON.stringify(coords, null, 2));
        
        return coords;
    }

    // Reverse geocode - get address from coordinates using LatLong.ai
    async getAddressFromCoordinates(latitude, longitude) {
        const startTime = Date.now();
        console.log('\n[getAddressFromCoordinates] START');
        console.log('├─ Latitude:', latitude);
        console.log('├─ Longitude:', longitude);
        
        try {
            const requestConfig = {
                params: {
                    lat: latitude,
                    lon: longitude
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            };
            
            console.log('├─ Request URL:', `${this.baseUrl}/v2/reverse`);
            console.log('├─ Request Params:', JSON.stringify(requestConfig.params, null, 2));

            const response = await axios.get(`${this.baseUrl}/v2/reverse`, requestConfig);
            
            console.log('├─ API Response Status:', response.status);
            console.log('├─ API Response Data:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.address) {
                const addressData = {
                    address: response.data.display_name || '',
                    pincode: response.data.address.postcode || '',
                    state: response.data.address.state || '',
                    district: response.data.address.state_district || response.data.address.county || '',
                    city: response.data.address.city || response.data.address.town || response.data.address.village || ''
                };
                
                console.log('├─ Success: Address extracted');
                console.log('├─ Address Data:', JSON.stringify(addressData, null, 2));
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
                
                return addressData;
            }

            console.log('├─ Warning: No address data in response');
            console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
            return null;
        } catch (error) {
            console.error('├─ ERROR in Reverse Geocoding:');
            console.error('├─ Error Type:', error.name);
            console.error('├─ Error Message:', error.message);
            if (error.response) {
                console.error('├─ Response Status:', error.response.status);
                console.error('├─ Response Data:', JSON.stringify(error.response.data, null, 2));
            }
            console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
            return null;
        }
    }

    // Calculate distance between two coordinates (in kilometers)
    calculateDistance(lat1, lon1, lat2, lon2) {
        console.log('\n[calculateDistance] START');
        console.log('├─ Point 1:', { lat: lat1, lon: lon1 });
        console.log('├─ Point 2:', { lat: lat2, lon: lon2 });
        
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        console.log('└─ Distance:', distance.toFixed(2), 'km');
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Get nearby locations within a radius using LatLong.ai
    async getNearbyLocations(latitude, longitude, radiusKm = 10, type = 'all') {
        const startTime = Date.now();
        console.log('\n[getNearbyLocations] START');
        console.log('├─ Latitude:', latitude);
        console.log('├─ Longitude:', longitude);
        console.log('├─ Radius:', radiusKm, 'km');
        console.log('├─ Type:', type);
        
        try {
            const requestConfig = {
                params: {
                    lat: latitude,
                    lon: longitude,
                    radius: radiusKm * 1000, // Convert km to meters
                    type: type
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            };
            
            console.log('├─ Request URL:', `${this.baseUrl}/v2/nearby`);
            console.log('├─ Request Params:', JSON.stringify(requestConfig.params, null, 2));

            const response = await axios.get(`${this.baseUrl}/v2/nearby`, requestConfig);
            
            console.log('├─ API Response Status:', response.status);
            console.log('├─ Results Count:', response.data?.results?.length || 0);

            if (response.data && response.data.results) {
                console.log('├─ Success: Found nearby locations');
                console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
                return response.data.results;
            }

            console.log('├─ Warning: No nearby locations found');
            console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
            return [];
        } catch (error) {
            console.error('├─ ERROR in Nearby Locations:');
            console.error('├─ Error Type:', error.name);
            console.error('├─ Error Message:', error.message);
            if (error.response) {
                console.error('├─ Response Status:', error.response.status);
                console.error('├─ Response Data:', JSON.stringify(error.response.data, null, 2));
            }
            console.log('└─ Duration:', (Date.now() - startTime) + 'ms');
            return [];
        }
    }

    // Get nearby pincodes within a radius
    async getNearbyPincodes(pincode, radiusKm = 10) {
        const startTime = Date.now();
        console.log('\n[getNearbyPincodes] START');
        console.log('├─ Center Pincode:', pincode);
        console.log('├─ Radius:', radiusKm, 'km');
        
        try {
            console.log('├─ Step 1: Getting center coordinates...');
            const centerCoords = await this.getCoordinatesFromPincode(pincode);
            
            console.log('├─ Step 2: Finding nearby locations...');
            const nearbyLocations = await this.getNearbyLocations(
                centerCoords.latitude,
                centerCoords.longitude,
                radiusKm
            );

            console.log('├─ Step 3: Extracting pincodes...');
            const nearbyPincodes = nearbyLocations
                .filter(location => location.address?.postcode)
                .map(location => location.address.postcode);

            console.log('├─ Found Pincodes:', nearbyPincodes.length);

            // Add the original pincode
            nearbyPincodes.unshift(pincode);

            // Remove duplicates
            const uniquePincodes = [...new Set(nearbyPincodes)];
            console.log('├─ Unique Pincodes:', uniquePincodes.length);
            console.log('├─ Pincodes:', uniquePincodes);
            console.log('└─ Total Duration:', (Date.now() - startTime) + 'ms');
            
            return uniquePincodes;
        } catch (error) {
            console.error('├─ ERROR in Nearby Pincodes:');
            console.error('├─ Error Type:', error.name);
            console.error('├─ Error Message:', error.message);
            console.log('├─ Returning original pincode only');
            console.log('└─ Total Duration:', (Date.now() - startTime) + 'ms');
            return [pincode];
        }
    }

    // Clear cache (useful for testing or periodic cleanup)
    clearCache() {
        console.log('\n[clearCache] START');
        console.log('├─ Current Cache Size:', this.pincodeCache.size);
        
        this.pincodeCache.clear();
        
        console.log('├─ Cache cleared');
        console.log('└─ New Cache Size:', this.pincodeCache.size);
    }

    // Get cache statistics
    getCacheStats() {
        const stats = {
            size: this.pincodeCache.size,
            keys: Array.from(this.pincodeCache.keys())
        };
        
        console.log('\n[getCacheStats]');
        console.log('├─ Cache Size:', stats.size);
        console.log('└─ Cached Pincodes:', stats.keys);
        
        return stats;
    }
}

module.exports = new LocationService();
