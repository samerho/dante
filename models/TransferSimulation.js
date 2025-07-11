const mongoose = require('mongoose');

const transferSimulationSchema = new mongoose.Schema({
  simulationId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  transfer: {
    from: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: 'Invalid from address format'
      }
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: 'Invalid to address format'
      }
    },
    amount: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return parseFloat(v) > 0;
        },
        message: 'Amount must be greater than 0'
      }
    },
    amountWei: {
      type: String,
      required: true
    },
    gasLimit: {
      type: String,
      default: '21000'
    },
    gasPrice: {
      type: String,
      required: true
    },
    maxFeePerGas: String,
    maxPriorityFeePerGas: String
  },
  simulation: {
    status: {
      type: String,
      enum: ['pending', 'simulating', 'success', 'failed', 'expired'],
      default: 'pending'
    },
    result: {
      success: Boolean,
      gasUsed: String,
      effectiveGasPrice: String,
      totalCost: String,
      totalCostWei: String,
      balanceAfter: String,
      balanceAfterWei: String,
      estimatedConfirmationTime: Number
    },
    errors: [{
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed
    }],
    warnings: [{
      type: String,
      message: String
    }],
    executedAt: Date,
    completedAt: Date
  },
  network: {
    chainId: {
      type: Number,
      default: 1
    },
    name: {
      type: String,
      default: 'mainnet'
    },
    blockNumber: Number,
    blockTimestamp: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    source: {
      type: String,
      enum: ['web', 'api', 'mobile'],
      default: 'api'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
transferSimulationSchema.index({ simulationId: 1 });
transferSimulationSchema.index({ 'user.walletAddress': 1, createdAt: -1 });
transferSimulationSchema.index({ 'simulation.status': 1 });
transferSimulationSchema.index({ createdAt: -1 });
transferSimulationSchema.index({ 'simulation.executedAt': -1 });

// TTL index - expire simulations after 24 hours
transferSimulationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Virtual for total cost in ETH
transferSimulationSchema.virtual('totalCostETH').get(function() {
  if (this.simulation.result && this.simulation.result.totalCost) {
    return parseFloat(this.simulation.result.totalCost);
  }
  return null;
});

// Methods
transferSimulationSchema.methods.updateStatus = function(status, result = null, errors = null) {
  this.simulation.status = status;
  
  if (result) {
    this.simulation.result = { ...this.simulation.result, ...result };
  }
  
  if (errors) {
    this.simulation.errors = Array.isArray(errors) ? errors : [errors];
  }
  
  if (status === 'simulating' && !this.simulation.executedAt) {
    this.simulation.executedAt = new Date();
  }
  
  if (['success', 'failed', 'expired'].includes(status)) {
    this.simulation.completedAt = new Date();
  }
  
  return this.save();
};

transferSimulationSchema.methods.addWarning = function(type, message) {
  this.simulation.warnings.push({ type, message });
  return this.save();
};

transferSimulationSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.metadata.ipAddress;
  delete obj.metadata.userAgent;
  return obj;
};

// Static methods
transferSimulationSchema.statics.findBySimulationId = function(simulationId) {
  return this.findOne({ simulationId });
};

transferSimulationSchema.statics.findByWallet = function(walletAddress, options = {}) {
  const { limit = 10, skip = 0, status = null } = options;
  
  const query = { 'user.walletAddress': walletAddress.toLowerCase() };
  if (status) {
    query['simulation.status'] = status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

transferSimulationSchema.statics.createSimulation = function(data) {
  const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return this.create({
    simulationId,
    user: {
      walletAddress: data.walletAddress.toLowerCase(),
      userId: data.userId
    },
    transfer: {
      from: data.from.toLowerCase(),
      to: data.to.toLowerCase(),
      amount: data.amount,
      amountWei: data.amountWei,
      gasLimit: data.gasLimit || '21000',
      gasPrice: data.gasPrice,
      maxFeePerGas: data.maxFeePerGas,
      maxPriorityFeePerGas: data.maxPriorityFeePerGas
    },
    network: {
      chainId: data.chainId || 1,
      name: data.networkName || 'mainnet',
      blockNumber: data.blockNumber,
      blockTimestamp: data.blockTimestamp
    },
    metadata: {
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      sessionId: data.sessionId,
      source: data.source || 'api'
    }
  });
};

module.exports = mongoose.model('TransferSimulation', transferSimulationSchema);