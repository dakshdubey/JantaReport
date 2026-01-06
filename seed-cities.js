const db = require('./backend/config/db');

const initialCities = [
    { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1657, lng: 79.9324 }
];

async function seedCities() {
    try {
        await db.initPool();
        for (const city of initialCities) {
            try {
                await db.query(
                    'INSERT INTO cities (city_name, state, latitude, longitude) VALUES (?, ?, ?, ?)',
                    [city.name, city.state, city.lat, city.lng]
                );
                console.log(`City ${city.name} added.`);
            } catch (e) {
                if (e.code === 'ER_DUP_ENTRY') {
                    console.log(`City ${city.name} already exists.`);
                } else {
                    throw e;
                }
            }
        }
        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedCities();
