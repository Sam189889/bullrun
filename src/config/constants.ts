// Contract Addresses - opBNB MAINNET
export const CONTRACTS = {
    USDT: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3' as `0x${string}`,  // Official opBNB USDT
    // Mainnet Deploy (2026-02-02)
    BULL_RUN: '0x31b8e2e95ee6bce2f2e139d76d25c53ceeeb1f2b' as `0x${string}`,
    // Read-only view contract (deployed 2026-03-02)
    BULL_RUN_VIEW: '0xF56d845Bec6e462fCab75C8762495e5830332B08' as `0x${string}`,
    PROXY_ADMIN: '0xbb959AE86fCaa0A226181F1AcDd4251298031F0C' as `0x${string}`,
    // RevenueSplitter (2026-02-03)
    REVENUE_SPLITTER: '0x5B72922F40bfD64Ce319eC26f1C2244A690b063A' as `0x${string}`,
} as const

// Contract deployment block - for efficient event queries (Mainnet deploy: 2026-02-02)
export const DEPLOY_BLOCK = BigInt(107759355)

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

// Network Configuration - opBNB MAINNET
export const NETWORK = {
    chainId: 204,
    name: 'opBNB Mainnet',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnbscan.com',
    currency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
    },
} as const

// Package IDs (will be set after creating packages)
export const PACKAGES = {
    // Add package IDs after creating them via admin panel
} as const
