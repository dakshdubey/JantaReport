const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketService = require('./services/socketService');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configRoutes = require('./routes/configRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);
const io = socketService.init(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ai', aiRoutes);

// Root Route - Serve Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Civic Issue Reporting API is running' });
});

// Centralized Error Handling
app.use((err, req, res, next) => {
    console.error('--- CENTRALIZED ERROR ---');
    console.error(err);
    console.error('------------------------');
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message,
        path: req.path
    });
});

// Start Server
const startServer = async () => {
    try {
        await db.initPool();
        server.listen(PORT, () => {
            console.log(`Server is running with Real-Time Sync on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
