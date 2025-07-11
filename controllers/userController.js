const userService = require('../services/userService');

class UserController {
  /**
   * @swagger
   * /user/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *                 message:
   *                   type: string
   *                   example: Profile retrieved successfully
   */
  async getProfile(req, res) {
    try {
      const profile = await userService.getProfile(req.user.walletAddress);
      
      res.json({
        success: true,
        data: profile,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      console.error('Get profile error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /user/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: user@example.com
   *               username:
   *                 type: string
   *                 example: cryptouser
   *               profile:
   *                 type: object
   *                 properties:
   *                   firstName:
   *                     type: string
   *                     example: John
   *                   lastName:
   *                     type: string
   *                     example: Doe
   *                   bio:
   *                     type: string
   *                     example: Crypto enthusiast
   *               preferences:
   *                 type: object
   *                 properties:
   *                   currency:
   *                     type: string
   *                     enum: [USD, EUR, GBP, ETH]
   *                     example: USD
   *     responses:
   *       200:
   *         description: Profile updated successfully
   */
  async updateProfile(req, res) {
    try {
      const updatedProfile = await userService.updateProfile(
        req.user.walletAddress,
        req.body
      );
      
      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /user/stats:
   *   get:
   *     summary: Get user statistics
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User statistics retrieved successfully
   */
  async getStats(req, res) {
    try {
      const stats = await userService.getUserStats(req.user.walletAddress);
      
      res.json({
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Get stats error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /user/logout:
   *   post:
   *     summary: Logout user session
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      await userService.logout(req.user.walletAddress, token);
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UserController();