import { http, createConfig, fallback } from 'wagmi'
import { Chain } from 'viem'
import { CONTRACTS, NETWORK } from './constants'

// Multiple RPC endpoints with fallback (auto-switches on failure)
const RPC_ENDPOINTS = [
  NETWORK.rpcUrl,
  ...(NETWORK.chainId === 204 ? [
    'https://opbnb.publicnode.com',
    'https://opbnb-mainnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5',
    'https://opbnb.drpc.org',
  ] : [
    'https://opbnb-testnet-rpc.bnbchain.org',
  ])
]

// Dynamic Chain Definition (testnet or mainnet based on constants.ts)
export const opBnbChain: Chain = {
  id: NETWORK.chainId,
  name: NETWORK.name,
  nativeCurrency: {
    decimals: NETWORK.currency.decimals,
    name: NETWORK.currency.name,
    symbol: NETWORK.currency.symbol,
  },
  rpcUrls: {
    default: { http: RPC_ENDPOINTS },
    public: { http: RPC_ENDPOINTS },
  },
  blockExplorers: {
    default: { 
      name: NETWORK.chainId === 204 ? 'opBNBScan' : 'opBNB Testnet Explorer', 
      url: NETWORK.explorerUrl 
    },
  },
  testnet: NETWORK.chainId === 5611,
  // Chain icon for RainbowKit
  iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  iconBackground: '#F3BA2F',
} as Chain & { iconUrl: string; iconBackground: string }

// Wagmi Config with fallback transport (auto-failover on rate limit)
export const config = createConfig({
  chains: [opBnbChain],
  transports: {
    [opBnbChain.id]: fallback(
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
