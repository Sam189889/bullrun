export interface NFT {
    id: string;
    value: number;
    status: 'available' | 'sold' | 'burned' | 'pending';
    createdAt: Date;
    imageUrl?: string;
}

export interface Package {
    id: string;
    registrationFee: number;
    nftValue: number;
    formula: string;
    requirements?: {
        directReferrals?: number;
        teamRequirement?: string;
    };
}

export interface User {
    walletAddress: string;
    packageId: string;
    totalIncome: number;
    todayIncome: number;
    nftsOwned: number;
    teamSize: number;
    directReferrals: number;
    eligibleLevels: number;
    joinDate: Date;
}

export interface Earnings {
    totalEarnings: number;
    withdrawable: number;
    burningDeductions: number;
    registrationIncome: number;
    levelIncome: number;
    tradingProfit: number;
    burningRewards: number;
}

export interface TeamMember {
    walletAddress: string;
    username?: string;
    packageId: string;
    joinDate: Date;
    status: 'active' | 'inactive';
    level: number;
}

export interface LevelIncome {
    level: number;
    ratePerNFT: number;
    todayIncome: number;
    totalIncome: number;
}

export interface Transaction {
    id: string;
    date: Date;
    type: 'registration' | 'level' | 'trading' | 'burn_reward' | 'deduction';
    amount: number;
    nftId?: string;
    status: 'credited' | 'processing' | 'pending';
}

export interface BurningWallet {
    currentBalance: number;
    totalBurned: number;
    totalDeducted: number;
}
