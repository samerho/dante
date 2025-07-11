const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// POST /auth/login - Authenticate with wallet address
router.post('/login', authController.login);

// GET /auth/verify - Verify JWT token
router.get('/verify', authMiddleware, authController.verify);

module.exports = router;