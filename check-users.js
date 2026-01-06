const db = require('./backend/config/db');

const checkUsers = async () => {
    try {
        await db.initPool();
        const users = await db.query('SELECT name, email, role FROM users');
        console.log('--- Current System Users ---');
        console.table(users);
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error.message);
        process.exit(1);
    }
};

checkUsers();
