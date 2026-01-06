const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '@nImesh12',
    database: process.env.DB_NAME || 'civic_issue_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

const initPool = async () => {
    try {
        // First, connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`Database '${dbConfig.database}' ensured.`);
        await connection.end();

        // Now create the pool with the database
        pool = mysql.createPool(dbConfig);
        console.log('MySQL Pool initialized.');

        await createTables();
        return pool;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

const createTables = async () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS cities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            city_name VARCHAR(100) NOT NULL UNIQUE,
            state VARCHAR(100) NOT NULL,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('CITIZEN', 'CITY_ADMIN', 'SUPER_ADMIN') NOT NULL,
            city_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS issues (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            city_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT,
            severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
            status ENUM('SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') DEFAULT 'SUBMITTED',
            latitude DECIMAL(10, 8) NOT NULL,
            longitude DECIMAL(11, 8) NOT NULL,
            address VARCHAR(255),
            image_url VARCHAR(255),
            video_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (city_id) REFERENCES cities(id)
        )`,
        `CREATE TABLE IF NOT EXISTS issue_status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            issue_id INT NOT NULL,
            status ENUM('SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL,
            remark TEXT,
            updated_by INT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (issue_id) REFERENCES issues(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS admin_actions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            issue_id INT,
            action VARCHAR(255) NOT NULL,
            details TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id),
            FOREIGN KEY (issue_id) REFERENCES issues(id)
        )`
    ];

    for (const query of queries) {
        await pool.query(query);
    }

    // Ensure video_url exists if table was created earlier
    try {
        await pool.query('ALTER TABLE issues ADD COLUMN video_url VARCHAR(255) AFTER image_url');
        console.log('Added video_url column to issues table.');
    } catch (e) {
        // Ignore if column already exists
        if (e.code !== 'ER_DUP_COLUMN_NAME') {
            console.error('Error adding video_url column:', e.message);
        }
    }

    console.log('Tables ensured.');
};

const query = async (sql, params) => {
    if (!pool) await initPool();
    const [results] = await pool.execute(sql, params);
    return results;
};

module.exports = {
    query,
    initPool,
    getPool: () => pool
};
