const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { walletLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication and rate limiting to all user routes
router.use(authMiddleware);
router.use(walletLimiter);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and account management
 */

// GET /user/profile - Get user profile
router.get('/profile', userController.getProfile);

// PUT /user/profile - Update user profile
router.put('/profile', userController.updateProfile);

// GET /user/stats - Get user statistics
router.get('/stats', userController.getStats);

// POST /user/logout - Logout user session
router.post('/logout', userController.logout);

module.exports = router;