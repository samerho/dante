# 🚀 Dante Vault API v2 - Deployment Instructions

## Quick Deploy to Render

### 1. Environment Variables (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=dante-vault-super-secret-jwt-key-2024-production-ready-web3-backend-framework

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dante-vault?retryWrites=true&w=majority

# Ethereum Network Configuration
INFURA_API_KEY=your-infura-project-id-here
INFURA_URL=https://mainnet.infura.io/v3/

# Etherscan API Configuration
ETHERSCAN_API_KEY=your-etherscan-api-key-here
ETHERSCAN_BASE_URL=https://api.etherscan.io/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Render Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18.x
- **Environment**: Node
- **Auto-Deploy**: Yes

### 3. Test URLs (once deployed)
- Landing Page: `https://your-app.onrender.com`
- API Docs: `https://your-app.onrender.com/api`
- Swagger UI: `https://your-app.onrender.com/docs`
- Health Check: `https://your-app.onrender.com/health`

### 4. Test Wallet Addresses
- Vitalik: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- Ethereum Foundation: `0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe`

### 5. Sample API Test
```bash
# Login
curl -X POST https://your-app.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'

# Get Balance (use token from login)
curl -X GET https://your-app.onrender.com/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔥 Ready to Impress Dante Labs!