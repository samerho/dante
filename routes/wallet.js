const express = require('express');
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');
const { walletLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication and rate limiting to all wallet routes
router.use(authMiddleware);
router.use(walletLimiter);

// GET /wallet/:address/balance - Get wallet balance
router.get('/:address/balance', walletController.getBalance);

// GET /wallet/:address/txs - Get transaction history
router.get('/:address/txs', walletController.getTransactions);

// GET /wallet/:address/overview - Get wallet overview
router.get('/:address/overview', walletController.getOverview);

module.exports = router;