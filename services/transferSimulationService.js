const { ethers } = require('ethers');
const TransferSimulation = require('../models/TransferSimulation');
const ethereumService = require('./ethereumService');

class TransferSimulationService {
  constructor() {
    this.provider = ethereumService.provider;
  }

  /**
   * Create a new transfer simulation
   */
  async createSimulation(data) {
    try {
      // Validate addresses
      if (!ethereumService.isValidAddress(data.from)) {
        throw new Error('Invalid from address');
      }
      if (!ethereumService.isValidAddress(data.to)) {
        throw new Error('Invalid to address');
      }

      // Validate amount
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to Wei
      const amountWei = ethers.parseEther(data.amount.toString()).toString();

      // Get current network info
      const networkInfo = await ethereumService.getNetworkInfo();
      const currentGasPrice = await this.provider.getFeeData();

      const simulationData = {
        walletAddress: data.walletAddress,
        userId: data.userId,
        from: data.from,
        to: data.to,
        amount: data.amount.toString(),
        amountWei,
        gasLimit: data.gasLimit || '21000',
        gasPrice: data.gasPrice || ethers.formatUnits(currentGasPrice.gasPrice, 'gwei'),
        maxFeePerGas: data.maxFeePerGas,
        maxPriorityFeePerGas: data.maxPriorityFeePerGas,
        chainId: parseInt(networkInfo.chainId),
        networkName: networkInfo.name,
        blockNumber: networkInfo.blockNumber,
        blockTimestamp: new Date(),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId,
        source: data.source
      };

      const simulation = await TransferSimulation.createSimulation(simulationData);
      
      // Start simulation process
      this.executeSimulation(simulation.simulationId);
      
      return simulation.toPublicJSON();
    } catch (error) {
      console.error('Error creating simulation:', error.message);
      throw new Error(`Simulation creation failed: ${error.message}`);
    }
  }

  /**
   * Execute the transfer simulation
   */
  async executeSimulation(simulationId) {
    try {
      const simulation = await TransferSimulation.findBySimulationId(simulationId);
      if (!simulation) {
        throw new Error('Simulation not found');
      }

      await simulation.updateStatus('simulating');

      // Get current balance
      const balanceData = await ethereumService.getBalance(simulation.transfer.from);
      const currentBalance = ethers.parseEther(balanceData.balance);
      const transferAmount = ethers.parseUnits(simulation.transfer.amountWei, 'wei');

      // Calculate gas costs
      const gasLimit = ethers.parseUnits(simulation.transfer.gasLimit, 'wei');
      const gasPrice = ethers.parseUnits(simulation.transfer.gasPrice, 'gwei');
      const gasCost = gasLimit * gasPrice;
      const totalCost = transferAmount + gasCost;

      // Simulate the transaction
      const simulationResult = {
        success: true,
        gasUsed: simulation.transfer.gasLimit,
        effectiveGasPrice: simulation.transfer.gasPrice,
        totalCost: ethers.formatEther(totalCost),
        totalCostWei: totalCost.toString(),
        balanceAfter: ethers.formatEther(currentBalance - totalCost),
        balanceAfterWei: (currentBalance - totalCost).toString(),
        estimatedConfirmationTime: this.estimateConfirmationTime(gasPrice)
      };

      // Check for potential issues
      const warnings = [];
      const errors = [];

      // Insufficient balance check
      if (currentBalance < totalCost) {
        simulationResult.success = false;
        errors.push({
          code: 'INSUFFICIENT_FUNDS',
          message: `Insufficient balance. Required: ${ethers.formatEther(totalCost)} ETH, Available: ${balanceData.balance} ETH`,
          details: {
            required: ethers.formatEther(totalCost),
            available: balanceData.balance,
            shortfall: ethers.formatEther(totalCost - currentBalance)
          }
        });
      }

      // Gas price warnings
      const networkGasPrice = await this.provider.getFeeData();
      const networkGasPriceGwei = parseFloat(ethers.formatUnits(networkGasPrice.gasPrice, 'gwei'));
      const simulationGasPriceGwei = parseFloat(simulation.transfer.gasPrice);

      if (simulationGasPriceGwei < networkGasPriceGwei * 0.8) {
        warnings.push({
          type: 'LOW_GAS_PRICE',
          message: `Gas price is ${((1 - simulationGasPriceGwei / networkGasPriceGwei) * 100).toFixed(1)}% below network average. Transaction may be slow.`
        });
      }

      if (simulationGasPriceGwei > networkGasPriceGwei * 1.5) {
        warnings.push({
          type: 'HIGH_GAS_PRICE',
          message: `Gas price is ${((simulationGasPriceGwei / networkGasPriceGwei - 1) * 100).toFixed(1)}% above network average. Consider reducing gas price.`
        });
      }

      // Self-transfer warning
      if (simulation.transfer.from.toLowerCase() === simulation.transfer.to.toLowerCase()) {
        warnings.push({
          type: 'SELF_TRANSFER',
          message: 'You are sending ETH to yourself. This will only cost gas fees.'
        });
      }

      // Update simulation with results
      const status = simulationResult.success ? 'success' : 'failed';
      await simulation.updateStatus(status, simulationResult, errors.length > 0 ? errors : null);

      // Add warnings if any
      for (const warning of warnings) {
        await simulation.addWarning(warning.type, warning.message);
      }

      return simulation;
    } catch (error) {
      console.error('Error executing simulation:', error.message);
      
      // Update simulation with error
      const simulation = await TransferSimulation.findBySimulationId(simulationId);
      if (simulation) {
        await simulation.updateStatus('failed', null, [{
          code: 'SIMULATION_ERROR',
          message: error.message
        }]);
      }
      
      throw error;
    }
  }

  /**
   * Get simulation by ID
   */
  async getSimulation(simulationId) {
    try {
      const simulation = await TransferSimulation.findBySimulationId(simulationId);
      if (!simulation) {
        throw new Error('Simulation not found');
      }
      
      return simulation.toPublicJSON();
    } catch (error) {
      console.error('Error getting simulation:', error.message);
      throw new Error(`Simulation retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get simulations for a wallet
   */
  async getSimulationsForWallet(walletAddress, options = {}) {
    try {
      const simulations = await TransferSimulation.findByWallet(walletAddress, options);
      return simulations.map(sim => sim.toPublicJSON());
    } catch (error) {
      console.error('Error getting wallet simulations:', error.message);
      throw new Error(`Wallet simulations retrieval failed: ${error.message}`);
    }
  }

  /**
   * Estimate confirmation time based on gas price
   */
  estimateConfirmationTime(gasPriceGwei) {
    const gasPrice = parseFloat(gasPriceGwei);
    
    // Rough estimates based on gas price (in seconds)
    if (gasPrice >= 50) return 30;      // High priority: ~30 seconds
    if (gasPrice >= 20) return 120;     // Standard: ~2 minutes
    if (gasPrice >= 10) return 300;     // Low: ~5 minutes
    return 600;                         // Very low: ~10 minutes
  }

  /**
   * Get simulation statistics
   */
  async getSimulationStats(walletAddress) {
    try {
      const allSimulations = await TransferSimulation.findByWallet(walletAddress, { limit: 100 });
      
      const stats = {
        total: allSimulations.length,
        successful: allSimulations.filter(s => s.simulation.status === 'success').length,
        failed: allSimulations.filter(s => s.simulation.status === 'failed').length,
        pending: allSimulations.filter(s => s.simulation.status === 'pending').length,
        totalValueSimulated: '0',
        averageGasPrice: '0',
        lastSimulation: allSimulations[0]?.createdAt || null
      };

      // Calculate totals
      let totalValue = ethers.parseEther('0');
      let totalGasPrice = 0;
      let gasPriceCount = 0;

      for (const sim of allSimulations) {
        if (sim.simulation.status === 'success') {
          totalValue += ethers.parseEther(sim.transfer.amount);
          totalGasPrice += parseFloat(sim.transfer.gasPrice);
          gasPriceCount++;
        }
      }

      stats.totalValueSimulated = ethers.formatEther(totalValue);
      stats.averageGasPrice = gasPriceCount > 0 ? (totalGasPrice / gasPriceCount).toFixed(2) : '0';

      return stats;
    } catch (error) {
      console.error('Error getting simulation stats:', error.message);
      throw new Error(`Simulation stats retrieval failed: ${error.message}`);
    }
  }
}

module.exports = new TransferSimulationService();