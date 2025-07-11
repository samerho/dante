const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
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
  value: {
    type: String,
    required: true
  },
  valueWei: {
    type: String,
    required: true
  },
  gasUsed: String,
  gasPrice: String,
  blockNumber: {
    type: Number,
    required: true
  },
  blockHash: String,
  transactionIndex: Number,
  confirmations: Number,
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  type: {
    type: String,
    enum: ['send', 'receive', 'contract', 'swap'],
    default: 'send'
  },
  metadata: {
    source: {
      type: String,
      enum: ['etherscan', 'infura', 'manual'],
      default: 'etherscan'
    },
    contractAddress: String,
    methodId: String,
    inputData: String,
    logs: [mongoose.Schema.Types.Mixed]
  },
  users: [{
    walletAddress: {
      type: String,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['sender', 'receiver']
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
transactionSchema.index({ hash: 1 });
transactionSchema.index({ from: 1, timestamp: -1 });
transactionSchema.index({ to: 1, timestamp: -1 });
transactionSchema.index({ blockNumber: -1 });
transactionSchema.index({ 'users.walletAddress': 1, timestamp: -1 });
transactionSchema.index({ timestamp: -1 });

// Virtual for transaction direction
transactionSchema.virtual('direction').get(function() {
  // This would be set based on the context of the requesting user
  return this._direction || 'unknown';
});

// Methods
transactionSchema.methods.getDirectionForUser = function(userWalletAddress) {
  const userAddress = userWalletAddress.toLowerCase();
  if (this.from === userAddress) return 'sent';
  if (this.to === userAddress) return 'received';
  return 'unknown';
};

transactionSchema.methods.addUser = function(walletAddress, role) {
  const existingUser = this.users.find(u => u.walletAddress === walletAddress.toLowerCase());
  if (!existingUser) {
    this.users.push({
      walletAddress: walletAddress.toLowerCase(),
      role: role
    });
  }
  return this.save();
};

// Static methods
transactionSchema.statics.findByWallet = function(walletAddress, options = {}) {
  const { limit = 10, skip = 0, sort = { timestamp: -1 } } = options;
  
  return this.find({
    $or: [
      { from: walletAddress.toLowerCase() },
      { to: walletAddress.toLowerCase() }
    ]
  })
  .sort(sort)
  .limit(limit)
  .skip(skip);
};

transactionSchema.statics.findByHash = function(hash) {
  return this.findOne({ hash: hash.toLowerCase() });
};

transactionSchema.statics.createFromEtherscan = function(txData, walletAddress) {
  const transaction = new this({
    hash: txData.hash,
    from: txData.from,
    to: txData.to,
    value: txData.value,
    valueWei: txData.valueWei,
    gasUsed: txData.gasUsed,
    gasPrice: txData.gasPrice,
    blockNumber: parseInt(txData.blockNumber),
    confirmations: parseInt(txData.confirmations),
    timestamp: new Date(txData.timestamp),
    metadata: {
      source: 'etherscan'
    }
  });

  // Add user relationships
  const userAddress = walletAddress.toLowerCase();
  if (txData.from.toLowerCase() === userAddress) {
    transaction.users.push({ walletAddress: userAddress, role: 'sender' });
    transaction.type = 'send';
  }
  if (txData.to.toLowerCase() === userAddress) {
    transaction.users.push({ walletAddress: userAddress, role: 'receiver' });
    transaction.type = 'receive';
  }

  return transaction;
};

module.exports = mongoose.model('Transaction', transactionSchema);