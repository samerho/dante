const { ethers } = require('ethers');
const ethereumProvider = require('../config/database');

class EthereumService {
  constructor() {
    this.provider = ethereumProvider.getProvider();
  }

  /**
   * Validate Ethereum address format
   */
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get ETH balance for an address
   */
  async getBalance(address) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      const balance = await this.provider.getBalance(address);
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);

      return {
        address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        blockNumber,
        timestamp: new Date(block.timestamp * 1000).toISOString(),
        network: 'mainnet'
      };
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching network info:', error.message);
      throw new Error(`Failed to fetch network info: ${error.message}`);
    }
  }
}

module.exports = new EthereumService();