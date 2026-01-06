const db = require('./backend/config/db');

async function check() {
    try {
        const cities = await db.query('SELECT * FROM cities');
        console.log('--- CITIES ---');
        console.table(cities);

        const users = await db.query('SELECT id, name, email, role, city_id FROM users');
        console.log('--- USERS ---');
        console.table(users);

        process.exit(0);
    } catch (error) {
        console.error('Error during check:', error);
        process.exit(1);
    }
}

check();
