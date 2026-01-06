const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password, role, city_id } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role is CITIZEN if not specified
        const userRole = role || 'CITIZEN';

        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role, city_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, city_id || null]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error registering user' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, city_id: user.city_id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city_id: user.city_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

const getProfile = async (req, res) => {
    try {
        const users = await db.query('SELECT id, name, email, role, city_id, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const stats = await db.query('SELECT COUNT(*) as total_issues FROM issues WHERE user_id = ?', [req.user.id]);

        res.json({ ...user, totalIssues: stats[0].total_issues });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

const updateProfile = async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

module.exports = { register, login, getProfile, updateProfile };
