const axios = require('axios');

class EtherscanService {
  constructor() {
    this.baseUrl = process.env.ETHERSCAN_BASE_URL || 'https://api.etherscan.io/api';
    this.apiKey = process.env.ETHERSCAN_API_KEY;
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address, limit = 5) {
    try {
      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: 'desc',
        apikey: this.apiKey || 'YourApiKeyToken'
      };

      const response = await axios.get(this.baseUrl, { 
        params,
        timeout: 10000 
      });

      if (response.data.status !== '1') {
        // If API fails, return demo data for showcase
        return this.getDemoTransactions(address);
      }

      const transactions = response.data.result.slice(0, limit).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (parseFloat(tx.value) / 1e18).toFixed(6),
        valueWei: tx.value,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations
      }));

      return {
        address,
        transactions,
        total: transactions.length,
        source: 'etherscan'
      };
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      // Return demo data if API fails
      return this.getDemoTransactions(address);
    }
  }

  /**
   * Demo transactions for showcase when API is not available
   */
  getDemoTransactions(address) {
    const demoTxs = [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x742d35cc6634c0532925a3b8d0c6964b0c6964b0',
        to: address,
        value: '0.150000',
        valueWei: '150000000000000000',
        gasUsed: '21000',
        gasPrice: '20000000000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        blockNumber: '18500000',
        confirmations: '12'
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        from: address,
        to: '0x8ba1f109551bd432803012645hac136c0c6964b0',
        value: '0.075000',
        valueWei: '75000000000000000',
        gasUsed: '21000',
        gasPrice: '18000000000',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        blockNumber: '18499950',
        confirmations: '62'
      }
    ];

    return {
      address,
      transactions: demoTxs,
      total: demoTxs.length,
      source: 'demo'
    };
  }
}

module.exports = new EtherscanService();