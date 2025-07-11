const express = require('express');
const ethereumService = require('../services/ethereumService');
const mongodbConnection = require('../config/mongodb');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     uptime:
 *                       type: number
 *                     ethereum:
 *                       type: object
 *                     mongodb:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: System is healthy
 */
// GET /health - Health check endpoint
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check Ethereum connection
    let ethereumStatus = 'disconnected';
    let ethereumData = {};
    
    try {
      ethereumData = await ethereumService.getNetworkInfo();
      ethereumStatus = 'connected';
    } catch (error) {
      console.error('Ethereum health check failed:', error.message);
    }

    // Check MongoDB connection
    const mongodbStatus = mongodbConnection.getConnectionStatus();

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
      ethereum: {
        status: ethereumStatus,
        network: ethereumData.name || 'unknown',
        blockNumber: ethereumData.blockNumber || null,
        chainId: ethereumData.chainId || null
      },
      mongodb: {
        status: mongodbStatus.isConnected ? 'connected' : 'disconnected',
        readyState: mongodbStatus.readyState,
        host: mongodbStatus.host,
        database: mongodbStatus.name
      },
      services: {
        jwt: process.env.JWT_SECRET ? 'configured' : 'missing',
        infura: process.env.INFURA_API_KEY ? 'configured' : 'missing',
        etherscan: process.env.ETHERSCAN_API_KEY ? 'configured' : 'missing',
        mongodb: process.env.MONGODB_URI ? 'configured' : 'missing'
      }
    };

    res.json({
      success: true,
      data: healthData,
      message: 'System is healthy'
    });

  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;