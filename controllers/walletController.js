const ethereumService = require('../services/ethereumService');
const etherscanService = require('../services/etherscanService');

class WalletController {
  /**
   * Get wallet balance
   */
  async getBalance(req, res) {
    try {
      const { address } = req.params;

      if (!ethereumService.isValidAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address'
        });
      }

      const balanceData = await ethereumService.getBalance(address);

      res.json({
        success: true,
        data: balanceData,
        message: 'Balance retrieved successfully'
      });

    } catch (error) {
      console.error('Balance fetch error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(req, res) {
    try {
      const { address } = req.params;
      const limit = parseInt(req.query.limit) || 5;

      if (!ethereumService.isValidAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address'
        });
      }

      if (limit > 20) {
        return res.status(400).json({
          success: false,
          error: 'Limit cannot exceed 20 transactions'
        });
      }

      const transactionData = await etherscanService.getTransactionHistory(address, limit);

      res.json({
        success: true,
        data: transactionData,
        message: 'Transaction history retrieved successfully'
      });

    } catch (error) {
      console.error('Transaction fetch error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get wallet overview (balance + recent transactions)
   */
  async getOverview(req, res) {
    try {
      const { address } = req.params;

      if (!ethereumService.isValidAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Ethereum address'
        });
      }

      const [balanceData, transactionData] = await Promise.all([
        ethereumService.getBalance(address),
        etherscanService.getTransactionHistory(address, 3)
      ]);

      res.json({
        success: true,
        data: {
          balance: balanceData,
          recentTransactions: transactionData.transactions,
          overview: {
            address,
            lastUpdated: new Date().toISOString()
          }
        },
        message: 'Wallet overview retrieved successfully'
      });

    } catch (error) {
      console.error('Overview fetch error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new WalletController();