const db = require('../config/db');
const geoService = require('../services/geoService');
const socketService = require('../services/socketService');

const createIssue = async (req, res) => {
    try {
        const { title, category, description, severity, latitude, longitude } = req.body;
        const user_id = req.user.id;

        // Handle file paths
        const image_url = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
        const video_url = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        // Automatically detect city from coordinates
        const city_id = await geoService.getCityFromCoords(latitude, longitude);

        const query = `
            INSERT INTO issues (user_id, city_id, title, category, description, severity, latitude, longitude, image_url, video_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
        `;
        const result = await db.query(query, [
            user_id,
            city_id,
            title,
            category,
            description,
            severity || 'MEDIUM', // Keep default for severity if not provided
            latitude,
            longitude,
            image_url,
            video_url
        ]);

        // Emit Real-Time Sync
        socketService.emitNewIssue(city_id, {
            id: result.insertId,
            user_id,
            city_id,
            title,
            category,
            description,
            severity,
            latitude,
            longitude,
            image_url,
            video_url,
            status: 'SUBMITTED',
            created_at: new Date(),
            reported_by: req.user.name
        });

        res.status(201).json({
            message: 'Issue reported successfully',
            issueId: result.insertId,
            city_id
        });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ message: 'Error creating issue', error: error.message });
    }
};

const getIssues = async (req, res) => {
    const { role, id, city_id } = req.user;
    let sql = 'SELECT i.*, c.city_name, u.name as reported_by FROM issues i JOIN cities c ON i.city_id = c.id JOIN users u ON i.user_id = u.id';
    let params = [];

    if (role === 'CITIZEN') {
        sql += ' WHERE i.user_id = ?';
        params.push(id);
    } else if (role === 'CITY_ADMIN') {
        sql += ' WHERE i.city_id = ?';
        params.push(city_id);
    }
    // SUPER_ADMIN sees all

    sql += ' ORDER BY i.created_at DESC';

    try {
        const issues = await db.query(sql, params);
        res.json(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ message: 'Error fetching issues' });
    }
};

const getIssueById = async (req, res) => {
    const { id } = req.params;
    const { role, id: user_id, city_id } = req.user;

    try {
        const issues = await db.query(
            'SELECT i.*, c.city_name, u.name as reported_by FROM issues i JOIN cities c ON i.city_id = c.id JOIN users u ON i.user_id = u.id WHERE i.id = ?',
            [id]
        );

        if (issues.length === 0) return res.status(404).json({ message: 'Issue not found' });

        const issue = issues[0];

        // Security check
        if (role === 'CITIZEN' && issue.user_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized access to this issue' });
        }
        if (role === 'CITY_ADMIN' && issue.city_id !== city_id) {
            return res.status(403).json({ message: 'Unauthorized access to this city\'s issues' });
        }

        const history = await db.query(
            'SELECT h.*, u.name as updated_by_name FROM issue_status_history h JOIN users u ON h.updated_by = u.id WHERE h.issue_id = ? ORDER BY h.updated_at ASC',
            [id]
        );

        res.json({ ...issue, history });
    } catch (error) {
        console.error('Error fetching issue details:', error);
        res.status(500).json({ message: 'Error fetching issue details' });
    }
};

const updateIssueStatus = async (req, res) => {
    const { id } = req.params;
    const { status, remark } = req.body;
    const admin_id = req.user.id;

    try {
        // Enforce transaction or consecutive updates
        await db.query('UPDATE issues SET status = ? WHERE id = ?', [status, id]);

        await db.query(
            'INSERT INTO issue_status_history (issue_id, status, remark, updated_by) VALUES (?, ?, ?, ?)',
            [id, status, remark, admin_id]
        );

        await db.query(
            'INSERT INTO admin_actions (admin_id, issue_id, action, details) VALUES (?, ?, ?, ?)',
            [admin_id, id, 'UPDATE_STATUS', `Status changed to ${status}. Remark: ${remark}`]
        );

        // Emit Real-Time status update
        const { city_id } = req.user; // Admins have city_id in their token/profile
        socketService.emitStatusUpdate(city_id, id, status);

        res.json({ message: 'Issue status updated successfully' });
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({ message: 'Error updating issue status' });
    }
};

module.exports = { createIssue, getIssues, getIssueById, updateIssueStatus };
