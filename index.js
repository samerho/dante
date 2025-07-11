require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/user');
const transferRoutes = require('./routes/transfer');

// Import services
const ethereumProvider = require('./config/database');
const mongodbConnection = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Routes
app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/health', healthRoutes);
app.use('/user', userRoutes);
app.use('/transfer', transferRoutes);

// Swagger API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Dante Vault API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Root endpoint - serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Dante Vault API',
      version: '1.0.0',
      description: 'Production-grade Web3 backend infrastructure for Dante Labs',
      endpoints: {
        authentication: {
          'POST /auth/login': 'Authenticate with wallet address',
          'GET /auth/verify': 'Verify JWT token'
        },
        wallet: {
          'GET /wallet/:address/balance': 'Get ETH balance',
          'GET /wallet/:address/txs': 'Get transaction history',
          'GET /wallet/:address/overview': 'Get wallet overview'
        },
        user: {
          'GET /user/profile': 'Get user profile',
          'PUT /user/profile': 'Update user profile',
          'GET /user/stats': 'Get user statistics',
          'POST /user/logout': 'Logout user session'
        },
        transfer: {
          'POST /transfer/simulate': 'Create transfer simulation',
          'GET /transfer/simulate/:id': 'Get simulation by ID',
          'GET /transfer/simulations': 'Get user simulations',
          'GET /transfer/stats': 'Get transfer statistics'
        },
        system: {
          'GET /health': 'System health check',
          'GET /api': 'API documentation',
          'GET /docs': 'Swagger UI documentation'
        }
      },
      authentication: 'Bearer JWT token required for wallet endpoints',
      rateLimit: '100 requests per 15 minutes',
      author: 'Mohamd Samer'
    },
    message: 'Welcome to Dante Vault API'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log('🚀 Dante Vault API Server Starting...');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/docs`);
  console.log(`🏠 Landing Page: http://localhost:${PORT}`);
  
  // Connect to MongoDB
  try {
    await mongodbConnection.connect();
  } catch (error) {
    console.log('⚠️ MongoDB connection failed, continuing without database features');
  }
  
  // Test Ethereum connection
  await ethereumProvider.testConnection();
  
  console.log('✅ Dante Vault API v2.0 is ready for Web3 operations!');
  console.log('🏛️ Built for Dante Labs - Next Generation Web3 Infrastructure');
});

module.exports = app;