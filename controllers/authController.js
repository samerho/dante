const jwt = require('jsonwebtoken');
const ethereumService = require('../services/ethereumService');
const userService = require('../services/userService');

class AuthController {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Authenticate with wallet address
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - walletAddress
   *             properties:
   *               walletAddress:
   *                 type: string
   *                 example: "0x742d35cc6634c0532925a3b8d0c6964b0c6964b0"
   *                 description: Ethereum wallet address
   *     responses:
   *       200:
   *         description: Authentication successful
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
   *                     token:
   *                       type: string
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                     walletAddress:
   *                       type: string
   *                       example: "0x742d35cc6634c0532925a3b8d0c6964b0c6964b0"
   *                     expiresIn:
   *                       type: string
   *                       example: "24h"
   *                     tokenType:
   *                       type: string
   *                       example: "Bearer"
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                 message:
   *                   type: string
   *                   example: "Authentication successful"
   */
  async login(req, res) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required'
        });
      }

      // Validate Ethereum address
      if (!ethereumService.isValidAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address format'
        });
      }

      // Find or create user
      const user = await userService.findOrCreateUser(walletAddress);

      // Create session
      const sessionData = await userService.createSession(user, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        success: true,
        data: {
          token: sessionData.token,
          walletAddress: walletAddress.toLowerCase(),
          expiresIn: sessionData.expiresAt,
          tokenType: 'Bearer',
          user: sessionData.user
        },
        message: 'Authentication successful'
      });

    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  /**
   * @swagger
   * /auth/verify:
   *   get:
   *     summary: Verify JWT token
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
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
   *                     walletAddress:
   *                       type: string
   *                     loginTime:
   *                       type: string
   *                       format: date-time
   *                     valid:
   *                       type: boolean
   *                       example: true
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                 message:
   *                   type: string
   *                   example: "Token is valid"
   */
  async verify(req, res) {
    try {
      res.json({
        success: true,
        data: {
          userId: req.user.userId,
          walletAddress: req.user.walletAddress,
          loginTime: req.user.loginTime,
          valid: true,
          user: req.user.user
        },
        message: 'Token is valid'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Token verification failed'
      });
    }
  }
}

module.exports = new AuthController();