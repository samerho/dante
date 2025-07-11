const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dante Vault API',
      version: '2.0.0',
      description: 'Production-grade Web3 backend infrastructure for Dante Labs',
      contact: {
        name: 'Mohamd Samer',
        email: 'dev@dantelabs.io'
      },
      license: {
        name: 'Proprietary',
        url: 'https://dantelabs.io/license'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.dantelabs.io' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            walletAddress: {
              type: 'string',
              example: '0x742d35cc6634c0532925a3b8d0c6964b0c6964b0'
            },
            email: {
              type: 'string',
              example: 'user@example.com'
            },
            username: {
              type: 'string',
              example: 'cryptouser'
            },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                bio: { type: 'string' },
                avatar: { type: 'string' }
              }
            },
            preferences: {
              type: 'object',
              properties: {
                currency: {
                  type: 'string',
                  enum: ['USD', 'EUR', 'GBP', 'ETH']
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                    transactions: { type: 'boolean' }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        WalletBalance: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              example: '0x742d35cc6634c0532925a3b8d0c6964b0c6964b0'
            },
            balance: {
              type: 'string',
              example: '1.234567890123456789'
            },
            balanceWei: {
              type: 'string',
              example: '1234567890123456789'
            },
            blockNumber: {
              type: 'number',
              example: 18500000
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            network: {
              type: 'string',
              example: 'mainnet'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            hash: {
              type: 'string',
              example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            },
            from: {
              type: 'string',
              example: '0x742d35cc6634c0532925a3b8d0c6964b0c6964b0'
            },
            to: {
              type: 'string',
              example: '0x8ba1f109551bd432803012645hac136c0c6964b0'
            },
            value: {
              type: 'string',
              example: '0.150000'
            },
            valueWei: {
              type: 'string',
              example: '150000000000000000'
            },
            gasUsed: {
              type: 'string',
              example: '21000'
            },
            gasPrice: {
              type: 'string',
              example: '20000000000'
            },
            blockNumber: {
              type: 'number',
              example: 18500000
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            confirmations: {
              type: 'string',
              example: '12'
            }
          }
        },
        TransferSimulation: {
          type: 'object',
          properties: {
            simulationId: {
              type: 'string',
              example: 'sim_1640995200000_abc123def'
            },
            user: {
              type: 'object',
              properties: {
                walletAddress: { type: 'string' },
                userId: { type: 'string' }
              }
            },
            transfer: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                amount: { type: 'string' },
                amountWei: { type: 'string' },
                gasLimit: { type: 'string' },
                gasPrice: { type: 'string' }
              }
            },
            simulation: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['pending', 'simulating', 'success', 'failed', 'expired']
                },
                result: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    gasUsed: { type: 'string' },
                    totalCost: { type: 'string' },
                    balanceAfter: { type: 'string' }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;