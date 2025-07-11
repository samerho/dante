const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format'
    }
  },
  username: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || validator.isURL(v);
        },
        message: 'Invalid avatar URL'
      }
    }
  },
  preferences: {
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'ETH'],
      default: 'USD'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true }
    },
    privacy: {
      showBalance: { type: Boolean, default: false },
      showTransactions: { type: Boolean, default: false }
    }
  },
  sessions: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    ipAddress: String,
    userAgent: String,
    isActive: { type: Boolean, default: true }
  }],
  security: {
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    backupCodes: [String]
  },
  walletData: {
    lastBalance: String,
    lastBalanceUpdate: Date,
    transactionCount: { type: Number, default: 0 },
    firstTransactionDate: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.sessions;
      delete ret.security.backupCodes;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ username: 1 }, { sparse: true });
userSchema.index({ 'sessions.token': 1 });
userSchema.index({ 'sessions.expiresAt': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Methods
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.sessions;
  delete user.security;
  return user;
};

userSchema.methods.addSession = function(sessionData) {
  this.sessions.push({
    token: sessionData.token,
    expiresAt: sessionData.expiresAt,
    ipAddress: sessionData.ipAddress,
    userAgent: sessionData.userAgent
  });
  
  // Keep only last 5 sessions
  if (this.sessions.length > 5) {
    this.sessions = this.sessions.slice(-5);
  }
  
  return this.save();
};

userSchema.methods.removeSession = function(token) {
  this.sessions = this.sessions.filter(session => session.token !== token);
  return this.save();
};

userSchema.methods.updateWalletData = function(balanceData) {
  this.walletData.lastBalance = balanceData.balance;
  this.walletData.lastBalanceUpdate = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

userSchema.statics.createFromWallet = function(walletAddress, additionalData = {}) {
  return this.create({
    walletAddress: walletAddress.toLowerCase(),
    ...additionalData
  });
};

module.exports = mongoose.model('User', userSchema);