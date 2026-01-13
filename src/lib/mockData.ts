import { NFT, Package, User, LevelIncome, Transaction, BurningWallet, TeamMember } from './types';

export const packages: Package[] = [
    {
        id: 'pkg-15',
        registrationFee: 15,
        nftValue: 175,
        formula: '$50 + ($25 × 3) + $50',
    },
    {
        id: 'pkg-25',
        registrationFee: 25,
        nftValue: 250,
        formula: '($50 + ($25 × 3)) × 2',
    },
    {
        id: 'pkg-50',
        registrationFee: 50,
        nftValue: 500,
        formula: '($50 + ($25 × 3)) × 4',
    },
    {
        id: 'pkg-100',
        registrationFee: 100,
        nftValue: 1000,
        formula: '($50 + ($25 × 3)) × 8',
    },
    {
        id: 'pkg-200',
        registrationFee: 200,
        nftValue: 2000,
        formula: '($50 + ($25 × 3)) × 16',
        requirements: {
            directReferrals: 4,
            teamRequirement: 'Any 4 traders must complete $50 registration',
        },
    },
    {
        id: 'pkg-400',
        registrationFee: 400,
        nftValue: 4000,
        formula: '($50 + ($25 × 3)) × 32',
        requirements: {
            directReferrals: 4,
            teamRequirement: 'Any 4 traders must complete $100 registration',
        },
    },
    {
        id: 'pkg-600',
        registrationFee: 600,
        nftValue: 6000,
        formula: '($50 + ($25 × 3)) × 48',
        requirements: {
            directReferrals: 6,
            teamRequirement: 'Any 4 traders must complete $200 registration',
        },
    },
    {
        id: 'pkg-800',
        registrationFee: 800,
        nftValue: 8000,
        formula: '($50 + ($25 × 3)) × 64',
        requirements: {
            directReferrals: 8,
            teamRequirement: 'Any 6 traders must complete $200 registration',
        },
    },
    {
        id: 'pkg-1000',
        registrationFee: 1000,
        nftValue: 10000,
        formula: '($50 + ($25 × 3)) × 80',
        requirements: {
            directReferrals: 10,
            teamRequirement: 'Any 8 traders must complete $200 registration',
        },
    },
];

export const mockNFTs: NFT[] = [
    { id: 'NFT001', value: 25, status: 'available', createdAt: new Date('2026-01-08T14:30:00') },
    { id: 'NFT002', value: 25, status: 'available', createdAt: new Date('2026-01-08T14:35:00') },
    { id: 'NFT003', value: 50, status: 'available', createdAt: new Date('2026-01-08T14:40:00') },
    { id: 'NFT004', value: 25, status: 'sold', createdAt: new Date('2026-01-08T13:00:00') },
    { id: 'NFT005', value: 25, status: 'available', createdAt: new Date('2026-01-08T14:45:00') },
    { id: 'NFT006', value: 50, status: 'burned', createdAt: new Date('2026-01-08T12:00:00') },
    { id: 'NFT007', value: 25, status: 'available', createdAt: new Date('2026-01-08T14:50:00') },
    { id: 'NFT008', value: 25, status: 'pending', createdAt: new Date('2026-01-08T14:55:00') },
    { id: 'NFT009', value: 25, status: 'available', createdAt: new Date('2026-01-08T15:00:00') },
    { id: 'NFT010', value: 50, status: 'available', createdAt: new Date('2026-01-08T15:05:00') },
    { id: 'NFT011', value: 25, status: 'available', createdAt: new Date('2026-01-08T15:10:00') },
    { id: 'NFT012', value: 25, status: 'available', createdAt: new Date('2026-01-08T15:15:00') },
];

export const mockUser: User = {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    packageId: 'pkg-100',
    totalIncome: 1234,
    todayIncome: 45,
    nftsOwned: 28,
    teamSize: 15,
    directReferrals: 4,
    eligibleLevels: 6,
    joinDate: new Date('2026-01-01'),
};

export const mockLevelIncome: LevelIncome[] = [
    { level: 0, ratePerNFT: 0.033, todayIncome: 1.23, totalIncome: 456.78 }, // Sponsor
    { level: 1, ratePerNFT: 0.0125, todayIncome: 0.89, totalIncome: 234.56 },
    { level: 2, ratePerNFT: 0.0125, todayIncome: 0.67, totalIncome: 189.23 },
    { level: 3, ratePerNFT: 0.0083, todayIncome: 0.45, totalIncome: 123.45 },
    { level: 4, ratePerNFT: 0.0083, todayIncome: 0.34, totalIncome: 98.76 },
    { level: 5, ratePerNFT: 0.0083, todayIncome: 0.23, totalIncome: 67.89 },
    { level: 6, ratePerNFT: 0.0083, todayIncome: 0.12, totalIncome: 45.67 },
    { level: 7, ratePerNFT: 0.0083, todayIncome: 0.08, totalIncome: 34.56 },
    { level: 8, ratePerNFT: 0.0083, todayIncome: 0.05, totalIncome: 23.45 },
    { level: 9, ratePerNFT: 0.0083, todayIncome: 0.03, totalIncome: 12.34 },
    { level: 10, ratePerNFT: 0.0083, todayIncome: 0.02, totalIncome: 8.90 },
    { level: 11, ratePerNFT: 0.0083, todayIncome: 0.01, totalIncome: 5.67 },
    { level: 12, ratePerNFT: 0.0083, todayIncome: 0.01, totalIncome: 3.45 },
    { level: 13, ratePerNFT: 0.0083, todayIncome: 0.005, totalIncome: 2.34 },
    { level: 14, ratePerNFT: 0.0083, todayIncome: 0.003, totalIncome: 1.23 },
    { level: 15, ratePerNFT: 0.0083, todayIncome: 0.001, totalIncome: 0.89 },
];

export const mockTransactions: Transaction[] = [
    { id: 'tx001', date: new Date('2026-01-08T14:30:00'), type: 'level', amount: 0.0083, nftId: 'NFT001', status: 'credited' },
    { id: 'tx002', date: new Date('2026-01-08T14:25:00'), type: 'burn_reward', amount: 25.75, nftId: 'NFT006', status: 'processing' },
    { id: 'tx003', date: new Date('2026-01-08T14:00:00'), type: 'registration', amount: 3.00, status: 'credited' },
    { id: 'tx004', date: new Date('2026-01-08T13:30:00'), type: 'trading', amount: 17.166, nftId: 'NFT004', status: 'credited' },
    { id: 'tx005', date: new Date('2026-01-08T12:00:00'), type: 'deduction', amount: -10, status: 'credited' },
];

export const mockBurningWallet: BurningWallet = {
    currentBalance: 2345,
    totalBurned: 12890,
    totalDeducted: 50,
};

export const mockTeamMembers: TeamMember[] = [
    { walletAddress: '0xabc...123', packageId: 'pkg-50', joinDate: new Date('2026-01-05'), status: 'active', level: 1 },
    { walletAddress: '0xdef...456', packageId: 'pkg-25', joinDate: new Date('2026-01-06'), status: 'active', level: 1 },
    { walletAddress: '0x789...abc', packageId: 'pkg-15', joinDate: new Date('2026-01-07'), status: 'inactive', level: 2 },
    { walletAddress: '0x456...def', packageId: 'pkg-100', joinDate: new Date('2026-01-07'), status: 'active', level: 2 },
];

export const deductionRules = [
    { package: '$15', threshold: 60, deduction: 10 },
    { package: '$25', threshold: 80, deduction: 10 },
    { package: '$50+', threshold: 100, deduction: 10 },
];

export const levelEligibility = [
    { referrals: 2, levels: 3 },
    { referrals: 4, levels: 6 },
    { referrals: 6, levels: 9 },
    { referrals: 8, levels: 12 },
    { referrals: 10, levels: 15 },
];
