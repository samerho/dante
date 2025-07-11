const transferSimulationService = require('../services/transferSimulationService');

class TransferController {
  /**
   * @swagger
   * /transfer/simulate:
   *   post:
   *     summary: Create a new transfer simulation
   *     tags: [Transfer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - from
   *               - to
   *               - amount
   *             properties:
   *               from:
   *                 type: string
   *                 example: "0x742d35cc6634c0532925a3b8d0c6964b0c6964b0"
   *                 description: Sender wallet address
   *               to:
   *                 type: string
   *                 example: "0x8ba1f109551bd432803012645hac136c0c6964b0"
   *                 description: Recipient wallet address
   *               amount:
   *                 type: string
   *                 example: "0.1"
   *                 description: Amount in ETH
   *               gasLimit:
   *                 type: string
   *                 example: "21000"
   *                 description: Gas limit (optional)
   *               gasPrice:
   *                 type: string
   *                 example: "20"
   *                 description: Gas price in Gwei (optional)
   *     responses:
   *       201:
   *         description: Transfer simulation created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TransferSimulation'
   *                 message:
   *                   type: string
   *                   example: Transfer simulation created successfully
   */
  async createSimulation(req, res) {
    try {
      const { from, to, amount, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas } = req.body;

      if (!from || !to || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: from, to, amount'
        });
      }

      const simulationData = {
        walletAddress: req.user.walletAddress,
        userId: req.user.userId,
        from,
        to,
        amount,
        gasLimit,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        sessionId: req.headers['x-session-id'],
        source: 'api'
      };

      const simulation = await transferSimulationService.createSimulation(simulationData);

      res.status(201).json({
        success: true,
        data: simulation,
        message: 'Transfer simulation created successfully'
      });

    } catch (error) {
      console.error('Create simulation error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /transfer/simulate/{simulationId}:
   *   get:
   *     summary: Get transfer simulation by ID
   *     tags: [Transfer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: simulationId
   *         required: true
   *         schema:
   *           type: string
   *         description: Simulation ID
   *     responses:
   *       200:
   *         description: Simulation retrieved successfully
   */
  async getSimulation(req, res) {
    try {
      const { simulationId } = req.params;
      const simulation = await transferSimulationService.getSimulation(simulationId);

      // Check if user owns this simulation
      if (simulation.user.walletAddress !== req.user.walletAddress) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this simulation'
        });
      }

      res.json({
        success: true,
        data: simulation,
        message: 'Simulation retrieved successfully'
      });

    } catch (error) {
      console.error('Get simulation error:', error.message);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /transfer/simulations:
   *   get:
   *     summary: Get user's transfer simulations
   *     tags: [Transfer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *         description: Number of simulations to return
   *       - in: query
   *         name: skip
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Number of simulations to skip
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, simulating, success, failed, expired]
   *         description: Filter by simulation status
   *     responses:
   *       200:
   *         description: Simulations retrieved successfully
   */
  async getSimulations(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const skip = parseInt(req.query.skip) || 0;
      const status = req.query.status;

      const options = { limit, skip };
      if (status) options.status = status;

      const simulations = await transferSimulationService.getSimulationsForWallet(
        req.user.walletAddress,
        options
      );

      res.json({
        success: true,
        data: {
          simulations,
          pagination: {
            limit,
            skip,
            count: simulations.length
          }
        },
        message: 'Simulations retrieved successfully'
      });

    } catch (error) {
      console.error('Get simulations error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /transfer/stats:
   *   get:
   *     summary: Get transfer simulation statistics
   *     tags: [Transfer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully
   */
  async getStats(req, res) {
    try {
      const stats = await transferSimulationService.getSimulationStats(req.user.walletAddress);

      res.json({
        success: true,
        data: stats,
        message: 'Transfer statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Get transfer stats error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TransferController();