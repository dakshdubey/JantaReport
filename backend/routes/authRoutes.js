const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', authenticateToken, authController.getProfile);
router.patch('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
