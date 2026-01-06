const db = require('./backend/config/db');
const bcrypt = require('bcryptjs');

const createCityAdmin = async () => {
    try {
        await db.initPool();

        // 1. Ensure at least one city exists
        let cities = await db.query('SELECT id FROM cities LIMIT 1');
        let cityId;

        if (cities.length === 0) {
            console.log('No cities found. Creating "New Delhi" as default...');
            const result = await db.query('INSERT INTO cities (city_name, state, latitude, longitude) VALUES (?, ?, ?, ?)',
                ['New Delhi', 'Delhi', 28.6139, 77.2090]);
            cityId = result.insertId;
        } else {
            cityId = cities[0].id;
        }

        // 2. Create the City Admin
        const name = 'Daksha Dubey';
        const email = 'dakshadubey@jantareport.in';
        const password = '12345678';
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (name, email, password_hash, role, city_id) VALUES (?, ?, ?, "CITY_ADMIN", ?)',
            [name, email, hashedPassword, cityId]
        );

        console.log('-----------------------------------');
        console.log('City Admin Created Successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Linked to City ID: ${cityId}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Operation failed:', error.message);
        process.exit(1);
    }
};

createCityAdmin();
