// Contract Addresses - opBNB Testnet (Fresh Deployment 2026-01-19)
export const CONTRACTS = {
    USDT: '0x9907964f13E7d6433Af61135E126326c4f6786b0' as `0x${string}`,  // Existing USDT
    BULL_RUN: '0x6e7a7ad3871c54373d641325d09285e7579f9a42' as `0x${string}`,  // New Proxy
    IMPLEMENTATION: '0xbe8d709ac695b7ff7fb6ecd9ee556488e382adbe' as `0x${string}`,  // New Implementation
    PROXY_ADMIN: '0xAdc4587f4fDcFd732d3768906Df40f4277272F57' as `0x${string}`,  // Existing ProxyAdmin
} as const

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
