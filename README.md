# 🏛️ Dante Vault API

**Production-Grade Web3 Backend Infrastructure for Dante Labs**

A comprehensive Node.js backend API that integrates with Ethereum mainnet, providing secure JWT authentication, real-time wallet data, and transaction history. Built with enterprise-grade security and performance in mind.

## 🚀 Features

- **🔐 JWT Authentication**: Secure wallet-based authentication system
- **💰 Real-time Balance**: Live ETH balance from Ethereum mainnet via Infura
- **📄 Transaction History**: Recent transaction data via Etherscan API
- **🛡️ Security**: Rate limiting, CORS, Helmet security headers
- **🎨 Modern Frontend**: Animated blockchain-themed landing page
- **📊 Health Monitoring**: Comprehensive system health checks
- **🔧 Production Ready**: Error handling, logging, graceful shutdown

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Blockchain**: Ethers.js, Infura, Etherscan API
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Frontend**: Vanilla HTML/CSS/JS with particle animations

## 📋 Prerequisites

Before running this project, you need to obtain API keys from:

1. **Infura** (Ethereum node provider)
   - Visit [infura.io](https://infura.io)
   - Create a free account
   - Create a new project
   - Copy your Project ID

2. **Etherscan** (Transaction data)
   - Visit [etherscan.io/apis](https://etherscan.io/apis)
   - Create a free account
   - Generate an API key

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Ethereum Network Configuration
INFURA_API_KEY=your-infura-project-id-here
INFURA_URL=https://mainnet.infura.io/v3/

# Etherscan API Configuration
ETHERSCAN_API_KEY=your-etherscan-api-key-here
ETHERSCAN_BASE_URL=https://api.etherscan.io/api
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 4. Access the Application
- **Landing Page**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📚 API Documentation

### Authentication

#### Login with Wallet Address
```http
POST /auth/login
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "walletAddress": "0x742d35cc6634c0532925a3b8d0c6964b0c6964b0",
    "expiresIn": "24h",
    "tokenType": "Bearer"
  },
  "message": "Authentication successful"
}
```

#### Verify Token
```http
GET /auth/verify
Authorization: Bearer <your-jwt-token>
```

### Wallet Operations

#### Get Wallet Balance
```http
GET /wallet/0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0/balance
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35cc6634c0532925a3b8d0c6964b0c6964b0",
    "balance": "1.234567890123456789",
    "balanceWei": "1234567890123456789",
    "blockNumber": 18500000,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "network": "mainnet"
  },
  "message": "Balance retrieved successfully"
}
```

#### Get Transaction History
```http
GET /wallet/0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0/txs?limit=5
Authorization: Bearer <your-jwt-token>
```

#### Get Wallet Overview
```http
GET /wallet/0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0/overview
Authorization: Bearer <your-jwt-token>
```

### System Endpoints

#### Health Check
```http
GET /health
```

## 🧪 Testing the API

### 1. Generate JWT Token Manually

You can generate a JWT token for testing using Node.js:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    walletAddress: '0x742d35cc6634c0532925a3b8d0c6964b0c6964b0',
    loginTime: new Date().toISOString()
  },
  'your-jwt-secret-here',
  { expiresIn: '24h' }
);

console.log('JWT Token:', token);
```

### 2. Test with cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0"}'

# Get balance (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/wallet/0x742d35Cc6634C0532925a3b8D0c6964b0c6964b0/balance \
  -H "Authorization: Bearer TOKEN"
```

### 3. Test Wallet Addresses

Use these real Ethereum addresses for testing:
- **Vitalik Buterin**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- **Ethereum Foundation**: `0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe`
- **Uniswap V2**: `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Ethereum address validation
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: Security headers and XSS protection
- **Error Handling**: Secure error responses

## 🏗️ Project Structure

```
dante-vault-api/
├── config/
│   └── database.js          # Ethereum provider configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── walletController.js  # Wallet operations
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── rateLimiter.js      # Rate limiting configuration
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── wallet.js           # Wallet routes
│   └── health.js           # Health check routes
├── services/
│   ├── ethereumService.js  # Ethereum blockchain service
│   └── etherscanService.js # Etherscan API service
├── public/
│   └── index.html          # Landing page
├── .env.example            # Environment template
├── index.js                # Main application file
└── README.md               # This file
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-jwt-secret-very-long-and-random
INFURA_API_KEY=your-production-infura-key
ETHERSCAN_API_KEY=your-production-etherscan-key
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

This project was built as a technical showcase for **Dante Labs**. For contributions or questions, please contact the development team.

## 📄 License

This project is proprietary software developed for Dante Labs.

---

**Dev by Mohamd Samer**

*Built for Dante Labs - Next Generation Web3 Infrastructure*

## 🎯 Technical Showcase

This project demonstrates:

- ✅ **Real Ethereum Integration**: Live mainnet data, no mocks
- ✅ **Production Security**: JWT, rate limiting, validation
- ✅ **Clean Architecture**: Modular, maintainable code structure
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Documentation**: Complete API documentation
- ✅ **Modern Frontend**: Animated, responsive design
- ✅ **Health Monitoring**: System status and diagnostics

Perfect for demonstrating backend development skills in the Web3 ecosystem! 🚀