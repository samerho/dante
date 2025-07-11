const User = require('../models/User');
const jwt = require('jsonwebtoken');

class UserService {
  /**
   * Find or create user by wallet address
   */
  async findOrCreateUser(walletAddress, additionalData = {}) {
    try {
      let user = await User.findByWallet(walletAddress);
      
      if (!user) {
        user = await User.createFromWallet(walletAddress, additionalData);
        console.log(`✅ New user created: ${walletAddress}`);
      }
      
      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error.message);
      throw new Error(`User service error: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(walletAddress, profileData) {
    try {
      const user = await User.findByWallet(walletAddress);
      if (!user) {
        throw new Error('User not found');
      }

      // Update profile fields
      if (profileData.email) user.email = profileData.email;
      if (profileData.username) user.username = profileData.username;
      
      if (profileData.profile) {
        user.profile = { ...user.profile, ...profileData.profile };
      }
      
      if (profileData.preferences) {
        user.preferences = { ...user.preferences, ...profileData.preferences };
      }

      await user.save();
      return user.toPublicJSON();
    } catch (error) {
      console.error('Error updating profile:', error.message);
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(walletAddress) {
    try {
      const user = await User.findByWallet(walletAddress);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user.toPublicJSON();
    } catch (error) {
      console.error('Error getting profile:', error.message);
      throw new Error(`Profile retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create user session
   */
  async createSession(user, sessionData) {
    try {
      const payload = {
        userId: user._id,
        walletAddress: user.walletAddress,
        loginTime: new Date().toISOString()
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h',
          issuer: 'dante-vault-api',
          audience: 'dante-labs'
        }
      );

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.addSession({
        token,
        expiresAt,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent
      });

      // Update security info
      user.security.lastLogin = new Date();
      user.security.loginAttempts = 0;
      await user.save();

      return {
        token,
        expiresAt,
        user: user.toPublicJSON()
      };
    } catch (error) {
      console.error('Error creating session:', error.message);
      throw new Error(`Session creation failed: ${error.message}`);
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if session exists and is active
      const session = user.sessions.find(s => s.token === token && s.isActive);
      if (!session) {
        throw new Error('Session not found or inactive');
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        throw new Error('Session expired');
      }

      return {
        user: user.toPublicJSON(),
        session: {
          token,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt
        }
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Logout user session
   */
  async logout(walletAddress, token) {
    try {
      const user = await User.findByWallet(walletAddress);
      if (!user) {
        throw new Error('User not found');
      }

      await user.removeSession(token);
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error.message);
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Update user wallet data
   */
  async updateWalletData(walletAddress, balanceData) {
    try {
      const user = await User.findByWallet(walletAddress);
      if (user) {
        await user.updateWalletData(balanceData);
      }
    } catch (error) {
      console.error('Error updating wallet data:', error.message);
      // Don't throw error for wallet data updates
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(walletAddress) {
    try {
      const user = await User.findByWallet(walletAddress);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = {
        accountAge: user.createdAt,
        lastLogin: user.security.lastLogin,
        sessionCount: user.sessions.filter(s => s.isActive).length,
        walletData: user.walletData,
        preferences: user.preferences
      };

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error.message);
      throw new Error(`Stats retrieval failed: ${error.message}`);
    }
  }
}

module.exports = new UserService();