// ========================================
// 🎯 NETWORK SWITCH - Change here only!
// ========================================
const USE_TESTNET = false // true = testnet, false = mainnet

// ========================================
// 🔧 MAINTENANCE MODE
// ========================================
export const MAINTENANCE_MODE = false// Set to true to enable maintenance mode
export const MAINTENANCE_CONFIG = {
    title: 'Platform Enhancement in Progress',
    message: 'We are implementing cutting-edge technology to deliver faster transactions, instant loading, and an even better trading experience. Thank you for your patience!',
    estimatedTime: '2-4 hours',
    showCountdown: false,
    allowAdmins: true, // Allow admin wallets to bypass maintenance
} as const

// ========================================
// TESTNET Configuration (opBNB Testnet)
// ========================================
const TESTNET_CONFIG = {
    chainId: 5611,
    name: 'opBNB Testnet',
    rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
    // rpcUrl: 'https://opbnb-testnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5',
    explorerUrl: 'https://testnet.opbnbscan.com',
    contracts: {
        USDT: '0x9907964f13E7d6433Af61135E126326c4f6786b0' as `0x${string}`,
        BULL_RUN: '0xEbe002fd383A77f43B69D6d54FaA61aA605ee62c' as `0x${string}`,
        BULL_RUN_VIEW: '0x078f4177d0A5d9936D130bD53Be2f5c4c8d50C43' as `0x${string}`, // Hub contract
        PROXY_ADMIN: '0xAdc4587f4fDcFd732d3768906Df40f4277272F57' as `0x${string}`,
        REVENUE_SPLITTER: '0x0A65d031a15453aC392098C8386dA874CFF6C7A5' as `0x${string}`,
    },
    deployBlock: BigInt(148632225), // Hub deployment block
    adminWallets: [
        '0xcc51a2dCCa13d63462d9E356d979952217c3508a' as `0x${string}`, // First User
        '0x3ec7B0Ffd2607D2BA47d11145208E16e6491C90F' as `0x${string}`, // Deployer
    ],
} as const

// ========================================
// MAINNET Configuration (opBNB Mainnet)
// ========================================
const MAINNET_CONFIG = {
    chainId: 204,
    name: 'opBNB Mainnet',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnbscan.com',
    contracts: {
        USDT: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3' as `0x${string}`,
        BULL_RUN: '0x31b8e2e95ee6bce2f2e139d76d25c53ceeeb1f2b' as `0x${string}`,
        BULL_RUN_VIEW: '0x74E7471F4e1a70998591fb5859c79e1A800F6dfa' as `0x${string}`,
        PROXY_ADMIN: '0xbb959AE86fCaa0A226181F1AcDd4251298031F0C' as `0x${string}`,
        REVENUE_SPLITTER: '0x5B72922F40bfD64Ce319eC26f1C2244A690b063A' as `0x${string}`,
    },
    deployBlock: BigInt(107759355), // Initial mainnet deploy
    adminWallets: [
        '0xcc51a2dCCa13d63462d9E356d979952217c3508a' as `0x${string}`, // First User
        '0x3ec7B0Ffd2607D2BA47d11145208E16e6491C90F' as `0x${string}`, // Deployer
    ],
} as const

// ========================================
// ACTIVE Configuration (auto-selected)
// ========================================
const ACTIVE_CONFIG = USE_TESTNET ? TESTNET_CONFIG : MAINNET_CONFIG

// Export active configuration
export const CONTRACTS = ACTIVE_CONFIG.contracts
export const DEPLOY_BLOCK = ACTIVE_CONFIG.deployBlock
export const ADMIN_WALLETS = ACTIVE_CONFIG.adminWallets
export const NETWORK = {
    chainId: ACTIVE_CONFIG.chainId,
    name: ACTIVE_CONFIG.name,
    rpcUrl: ACTIVE_CONFIG.rpcUrl,
    explorerUrl: ACTIVE_CONFIG.explorerUrl,
    currency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
    },
} as const

// Check if address is admin
export function isAdmin(address: string | undefined): boolean {
    if (!address) return false
    return ADMIN_WALLETS.some(
        (admin) => admin.toLowerCase() === address.toLowerCase()
    )
}

// Package IDs (will be set after creating packages)
export const PACKAGES = {
    // Add package IDs after creating them via admin panel
} as const
