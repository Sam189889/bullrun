import { http, createConfig, fallback } from 'wagmi'
import { Chain } from 'viem'
import { CONTRACTS } from './constants'

// Multiple RPC endpoints for opBNB Mainnet (fallback on rate limit)
const RPC_ENDPOINTS = [
  'https://opbnb-mainnet-rpc.bnbchain.org',
  'https://opbnb.publicnode.com',
  'https://opbnb-mainnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5',
  'https://opbnb.drpc.org',
]

// opBNB Mainnet Chain Definition with icon
export const opBnbMainnet: Chain = {
  id: 204,
  name: 'opBNB Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: RPC_ENDPOINTS },
    public: { http: RPC_ENDPOINTS },
  },
  blockExplorers: {
    default: { name: 'opBNBScan', url: 'https://opbnbscan.com' },
  },
  testnet: false,
  // Chain icon for RainbowKit
  iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  iconBackground: '#F3BA2F',
} as Chain & { iconUrl: string; iconBackground: string }

// Wagmi Config with fallback transport (auto-failover on rate limit)
export const config = createConfig({
  chains: [opBnbMainnet],
  transports: {
    [opBnbMainnet.id]: fallback(
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
  bullRunView: CONTRACTS.BULL_RUN_VIEW,
  proxyAdmin: CONTRACTS.PROXY_ADMIN,
}
