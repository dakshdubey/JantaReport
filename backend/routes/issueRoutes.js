const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public/Shared Routes
router.get('/', authenticateToken, issueController.getIssues);
router.get('/:id', authenticateToken, issueController.getIssueById);

// Citizen Routes
router.post('/',
    authenticateToken,
    authorizeRoles('CITIZEN'),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]),
    issueController.createIssue
);

// Authority Routes
router.patch('/:id/status',
    authenticateToken,
    authorizeRoles('CITY_ADMIN', 'SUPER_ADMIN'),
    issueController.updateIssueStatus
);

module.exports = router;
