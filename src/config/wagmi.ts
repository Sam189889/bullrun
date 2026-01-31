import { http, createConfig, fallback } from 'wagmi'
import { Chain } from 'viem'
import { CONTRACTS } from './constants'

// Multiple RPC endpoints for opBNB Testnet (fallback on rate limit)
const RPC_ENDPOINTS = [
  'https://opbnb-testnet-rpc.bnbchain.org',
  'https://opbnb-testnet.publicnode.com',
  'https://opbnb-testnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5',
  'https://opbnb-testnet.drpc.org',
]

// opBNB Testnet Chain Definition with icon
export const opBnbTestnet: Chain = {
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: { http: RPC_ENDPOINTS },
    public: { http: RPC_ENDPOINTS },
  },
  blockExplorers: {
    default: { name: 'opBNBScan', url: 'https://testnet.opbnbscan.com' },
  },
  testnet: true,
  // Chain icon for RainbowKit
  iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  iconBackground: '#F3BA2F',
} as Chain & { iconUrl: string; iconBackground: string }

// Wagmi Config with fallback transport (auto-failover on rate limit)
export const config = createConfig({
  chains: [opBnbTestnet],
  transports: {
    [opBnbTestnet.id]: fallback(
      RPC_ENDPOINTS.map(url => http(url, {
        timeout: 10000,
        retryCount: 2,
      }))
    ),
  },
})

// Re-export contracts for backward compatibility
export const contracts = {
  usdt: CONTRACTS.USDT,
  bullRun: CONTRACTS.BULL_RUN,
  proxyAdmin: CONTRACTS.PROXY_ADMIN,
}

