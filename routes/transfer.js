const express = require('express');
const transferController = require('../controllers/transferController');
const authMiddleware = require('../middleware/auth');
const { walletLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication and rate limiting to all transfer routes
router.use(authMiddleware);
router.use(walletLimiter);

/**
 * @swagger
 * tags:
 *   name: Transfer
 *   description: Ethereum transfer simulation and management
 */

// POST /transfer/simulate - Create transfer simulation
router.post('/simulate', transferController.createSimulation);

// GET /transfer/simulate/:simulationId - Get simulation by ID
router.get('/simulate/:simulationId', transferController.getSimulation);

// GET /transfer/simulations - Get user's simulations
router.get('/simulations', transferController.getSimulations);

// GET /transfer/stats - Get transfer statistics
router.get('/stats', transferController.getStats);

module.exports = router;