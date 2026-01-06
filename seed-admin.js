const db = require('./backend/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
    try {
        await db.initPool();

        const name = 'System Admin';
        const email = 'admin@jantareport.in';
        const password = 'AdminPassword123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.getPool().query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "SUPER_ADMIN")',
            [name, email, hashedPassword]
        );

        console.log('-----------------------------------');
        console.log('Super Admin Created Successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

seed();
