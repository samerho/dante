const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token missing from authorization header'
      });
    }

    // Validate session using user service
    const sessionData = await userService.validateSession(token);
    req.user = {
      userId: sessionData.user._id,
      walletAddress: sessionData.user.walletAddress,
      loginTime: sessionData.session.createdAt,
      user: sessionData.user
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;