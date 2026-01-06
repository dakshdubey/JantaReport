const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyA_Sx8LXvaLUMDjMFdwuyc3-HaUVlkPXzI';

const getCityFromCoords = async (lat, lng) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);

        if (response.data.status !== 'OK') {
            throw new Error('Geocoding API error: ' + response.data.status);
        }

        const results = response.data.results;
        let cityName = null;
        let stateName = null;

        // Search for city in address components
        for (const result of results) {
            for (const component of result.address_components) {
                if (component.types.includes('locality')) {
                    cityName = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    stateName = component.long_name;
                }
            }
            if (cityName && stateName) break;
        }

        if (!cityName) {
            // Fallback to larger area if locality not found
            for (const result of results) {
                for (const component of result.address_components) {
                    if (component.types.includes('administrative_area_level_2')) {
                        cityName = component.long_name;
                        break;
                    }
                }
                if (cityName) break;
            }
        }

        if (!cityName) throw new Error('City could not be identified from coordinates');

        // Check if city exists in our DB, if not, create it
        let cities = await db.query('SELECT id FROM cities WHERE city_name = ?', [cityName]);

        if (cities.length === 0) {
            const result = await db.query(
                'INSERT INTO cities (city_name, state, latitude, longitude) VALUES (?, ?, ?, ?)',
                [cityName, stateName || 'Unknown', lat, lng]
            );
            return result.insertId;
        }

        return cities[0].id;
    } catch (error) {
        console.error('Error in getCityFromCoords:', error.message);
        throw error;
    }
};

module.exports = { getCityFromCoords };
