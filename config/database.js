const { ethers } = require('ethers');

class EthereumProvider {
  constructor() {
    this.provider = null;
    this.initProvider();
  }

  initProvider() {
    try {
      const infuraUrl = `${process.env.INFURA_URL}${process.env.INFURA_API_KEY}`;
      this.provider = new ethers.JsonRpcProvider(infuraUrl);
      console.log('✅ Ethereum provider initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Ethereum provider:', error.message);
      // Fallback to public provider for demo purposes
      this.provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    }
  }

  getProvider() {
    return this.provider;
  }

  async testConnection() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`🔗 Connected to Ethereum mainnet, latest block: ${blockNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Ethereum connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new EthereumProvider();