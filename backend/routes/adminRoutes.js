const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const bcrypt = require('bcryptjs');

// Get global stats
router.get('/stats', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM issues) as total_issues,
                (SELECT COUNT(*) FROM issues WHERE status = 'RESOLVED') as resolved_issues,
                (SELECT COUNT(*) FROM cities) as total_cities,
                (SELECT COUNT(*) FROM users WHERE role = 'CITY_ADMIN') as total_admins
        `);

        const cityStats = await db.query(`
            SELECT c.city_name, COUNT(i.id) as count 
            FROM cities c 
            LEFT JOIN issues i ON c.id = i.city_id 
            GROUP BY c.id 
            LIMIT 10
        `);

        res.json({ ...stats[0], cityStats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Get all cities
router.get('/cities', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
    try {
        const cities = await db.query('SELECT * FROM cities ORDER BY city_name ASC');
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities' });
    }
});

// Create City Admin
router.post('/city-admin', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
    let { name, email, password, city_id } = req.body;

    // Basic validation
    if (!name || !email || !password || !city_id) {
        return res.status(400).json({ message: 'All fields are required including Operational District' });
    }

    try {
        // Check if user already exists
        const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Ensure city_id is an integer
        const cityIdInt = parseInt(city_id);
        if (isNaN(cityIdInt)) {
            return res.status(400).json({ message: 'Invalid Operational District' });
        }

        await db.query(
            'INSERT INTO users (name, email, password_hash, role, city_id) VALUES (?, ?, ?, "CITY_ADMIN", ?)',
            [name, email, hashedPassword, cityIdInt]
        );
        res.status(201).json({ message: 'City Admin commissioned successfully' });
    } catch (error) {
        console.error('Error creating City Admin:', error);
        res.status(500).json({ message: 'Error creating City Admin', detail: error.message });
    }
});

// Get specific city intel (Drill-down)
router.get('/cities/:id/intel', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req, res) => {
    const { id } = req.params;
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM issues WHERE city_id = ?) as total,
                (SELECT COUNT(*) FROM issues WHERE city_id = ? AND status = 'RESOLVED') as resolved,
                (SELECT COUNT(*) FROM issues WHERE city_id = ? AND status = 'IN_PROGRESS') as in_progress,
                (SELECT COUNT(*) FROM users WHERE city_id = ? AND role = 'CITY_ADMIN') as admins
        `, [id, id, id, id]);

        const recentIssues = await db.query(`
            SELECT i.*, u.name as reported_by 
            FROM issues i 
            JOIN users u ON i.user_id = u.id 
            WHERE i.city_id = ? 
            ORDER BY i.created_at DESC 
            LIMIT 5
        `, [id]);

        res.json({ stats: stats[0], recentIssues });
    } catch (error) {
        console.error('Error fetching city intel:', error);
        res.status(500).json({ message: 'Error fetching district intelligence' });
    }
});

module.exports = router;
