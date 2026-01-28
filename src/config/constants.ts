// Contract Addresses - opBNB Testnet
export const CONTRACTS = {
    USDT: '0x9907964f13E7d6433Af61135E126326c4f6786b0' as `0x${string}`,  // Existing USDT
    // Latest Proxy (2026-01-28) - WITH NFT OWNERSHIP TRACKING & FIXES
    BULL_RUN: '0xF0CC24AA7975e67509d8b4F814B2445Ae50c4f42' as `0x${string}`,
    PROXY_ADMIN: '0xAdc4587f4fDcFd732d3768906Df40f4277272F57' as `0x${string}`,
} as const

// Contract deployment block - used for efficient event queries
export const DEPLOY_BLOCK = BigInt(123050674)

// Admin Wallet Addresses
export const ADMIN_WALLETS: `0x${string}`[] = [
    '0xcc51a2dCCa13d63462d9E356d979952217c3508a', // First User (Admin)
    '0x3ec7B0Ffd2607D2BA47d11145208E16e6491C90F', // Deployer
]

// Check if address is admin
export function isAdmin(address: string | undefined): boolean {
    if (!address) return false
    return ADMIN_WALLETS.some(
        (admin) => admin.toLowerCase() === address.toLowerCase()
    )
}

// Network Configuration
export const NETWORK = {
    chainId: 5611,
    name: 'opBNB Testnet',
    rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
    explorerUrl: 'https://testnet.opbnbscan.com',
    currency: {
        name: 'tBNB',
        symbol: 'tBNB',
        decimals: 18,
    },
} as const

// Package IDs (will be set after creating packages)
export const PACKAGES = {
    // Add package IDs after creating them via admin panel
} as const
