// Environment Variables - bundled with build
// These values are compiled into the build so no .env.local needed in production

// WalletConnect Project ID
export const WALLETCONNECT_PROJECT_ID = 'd6797342748bc21d19d27e07525538d7'

// Network Configuration - opBNB MAINNET
export const CHAIN_ID = 204 // opBNB Mainnet

// RPC URLs
export const RPC_URL = 'https://opbnb-mainnet-rpc.bnbchain.org'

// Block Explorer
export const BLOCK_EXPLORER_URL = 'https://opbnbscan.com'

// API Configuration
// Use relative path - Next.js will proxy to Express API on port 3001
export const API_BASE_URL = '/api/admin'
export const USER_API_BASE_URL = '/api'
