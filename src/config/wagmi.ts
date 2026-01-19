import { http, createConfig } from 'wagmi'
import { Chain } from 'viem'
import { CONTRACTS } from './constants'

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
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: { name: 'opBNBScan', url: 'https://testnet.opbnbscan.com' },
  },
  testnet: true,
  // Chain icon for RainbowKit
  iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  iconBackground: '#F3BA2F',
} as Chain & { iconUrl: string; iconBackground: string }

// Wagmi Config
export const config = createConfig({
  chains: [opBnbTestnet],
  transports: {
    [opBnbTestnet.id]: http(),
  },
})

// Re-export contracts for backward compatibility
export const contracts = {
  usdt: CONTRACTS.USDT,
  bullRun: CONTRACTS.BULL_RUN,
  implementation: CONTRACTS.IMPLEMENTATION,
  proxyAdmin: CONTRACTS.PROXY_ADMIN,
}
