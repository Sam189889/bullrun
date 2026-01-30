'use client'

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contracts } from '@/config/wagmi'
import { BullRunMainLogicABI, USDTbABI } from '@/abi'

// ============ READ HOOKS ============

/**
 * Get user ID by wallet address
 */
export function useUserId(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount()
    const wallet = address || connectedAddress

    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'getUserIdByWallet',
        args: wallet ? [wallet] : undefined,
        query: { enabled: !!wallet },
    })
}

/**
 * Get user info by ID - returns User struct
 */
export function useUserInfo(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'getUserInfo',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user's direct referrals
 */
export function useDirectReferrals(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'getDirectReferrals',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user earnings breakdown
 */
export function useUserEarnings(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'packageEarnings',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user withdrawable balance
 */
export function useUserBalance(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userBalances',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user team volume
 */
export function useUserTeamVolume(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userTeamVolume',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user wallet address by ID from allUsers array
 */
export function useUserWallet(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'allUsers',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user current rank
 */
export function useUserRank(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userRanks',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Check if user exists by ID (for referrer validation)
 */
export function useUserExists(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userExists',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get package info by level (1-indexed: 1-9)
 */
export function usePackage(packageLevel: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'getPackageInfo',
        args: packageLevel ? [packageLevel] : undefined,
        query: { enabled: !!packageLevel && packageLevel > BigInt(0) },
    })
}

/**
 * Get USDT balance
 */
export function useUSDTBalance(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount()
    const wallet = address || connectedAddress

    return useReadContract({
        address: contracts.usdt,
        abi: USDTbABI,
        functionName: 'balanceOf',
        args: wallet ? [wallet] : undefined,
        query: { enabled: !!wallet },
    })
}

/**
 * Get USDT allowance for BullRun contract
 */
export function useUSDTAllowance(address?: `0x${string}`) {
    const { address: connectedAddress } = useAccount()
    const wallet = address || connectedAddress

    return useReadContract({
        address: contracts.usdt,
        abi: USDTbABI,
        functionName: 'allowance',
        args: wallet ? [wallet, contracts.bullRun] : undefined,
        query: { enabled: !!wallet },
    })
}

// ============ WRITE HOOKS ============

/**
 * Register new user
 */
export function useRegister() {
    const { writeContract, ...rest } = useWriteContract()

    const register = (userAddress: `0x${string}`, referrerId: bigint, packageId: bigint) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'register',
            args: [userAddress, referrerId, packageId],
        })
    }

    return { register, ...rest }
}

/**
 * Purchase new package
 */
export function usePurchasePackage() {
    const { writeContract, ...rest } = useWriteContract()

    const purchase = (userAddress: `0x${string}`, packageId: bigint) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'purchaseNewPackage',
            args: [userAddress, packageId],
        })
    }

    return { purchase, ...rest }
}

/**
 * Claim rank EMI
 */
export function useClaimRankEmi() {
    const { writeContract, ...rest } = useWriteContract()

    const claimEmi = (rank: number) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'claimRankEmi',
            args: [rank],
        })
    }

    return { claimEmi, ...rest }
}

/**
 * Claim fast bonus
 */
export function useClaimFastBonus() {
    const { writeContract, ...rest } = useWriteContract()

    const claimFastBonus = (rank: number) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'claimFastBonus',
            args: [rank],
        })
    }

    return { claimFastBonus, ...rest }
}

/**
 * Get user rank data for a specific rank
 */
export function useUserRankData(userId: bigint | undefined, rank: number) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userRanks',
        args: userId ? [userId, rank] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Withdraw available balance ($5 minimum)
 */
export function useWithdraw() {
    const { writeContract, ...rest } = useWriteContract()

    const withdraw = (amount: bigint) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'withdraw',
            args: [amount],
        })
    }

    return { withdraw, ...rest }
}

// ============ NFT TRADING HOOKS ============

/**
 * Get total NFTs count
 */
export function useTotalNFTs() {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'totalNFTs',
    })
}

/**
 * Get NFT by ID
 */
export function useNFT(nftId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'nfts',
        args: nftId ? [nftId] : undefined,
        query: {
            enabled: !!nftId && nftId > BigInt(0),
            refetchInterval: 5000, // Refetch every 5 seconds to update ownership
        },
    })
}

/**
 * Get user's available daily trading limit (contract calculated)
 */
export function useUserAvailableLimit(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'getUserAvailableLimit',
        args: userId ? [userId] : undefined,
        query: {
            enabled: !!userId && userId > BigInt(0),
            refetchInterval: 3000, // Refetch every 3 seconds
        },
    })
}

/**
 * Get user's raw daily limit data (totalLimit, usedLimit, lastResetDay)
 */
export function useUserDailyLimitData(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userDailyLimits',
        args: userId ? [userId] : undefined,
        query: {
            enabled: !!userId && userId > BigInt(0),
            refetchInterval: 3000,
        },
    })
}

/**
 * Get user's trading volume
 */
export function useUserTradingVolume(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userTradingVolume',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get user's trading earnings
 */
export function useUserTradingEarnings(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'tradingEarnings',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Buy NFT
 */
export function useBuyNFT() {
    const { writeContract, ...rest } = useWriteContract()

    const buyNFT = (nftId: bigint) => {
        writeContract({
            address: contracts.bullRun,
            abi: BullRunMainLogicABI,
            functionName: 'buyNFT',
            args: [nftId],
        })
    }

    return { buyNFT, ...rest }
}

// ============ LUCKY DRAW HOOKS ============

/**
 * Get lucky draw pool info (balance, weekNumber, lastDrawAt)
 */
export function useLuckyDrawPool() {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'luckyDrawPool',
    })
}

/**
 * Get user's lucky draw entries for a week
 */
export function useUserLuckyDrawEntries(userId: bigint | undefined, weekNumber: number) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userLuckyDrawEntries',
        args: userId ? [userId, weekNumber] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) && weekNumber > 0 },
    })
}

/**
 * Get total weekly lucky draw entries
 */
export function useTotalLuckyDrawEntries(weekNumber: number) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'totalWeeklyLuckyEntries',
        args: [weekNumber],
        query: { enabled: weekNumber > 0 },
    })
}

/**
 * Get lucky draw entry threshold ($100 = 1 entry by default)
 */
export function useLuckyDrawThreshold() {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'luckyDrawEntryThreshold',
    })
}

/**
 * Get user's NFT ID at specific index
 */
export function useUserNFT(userId: bigint | undefined, index: number) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userNFTs',
        args: userId ? [userId, index] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) && index >= 0 },
    })
}

/**
 * Get count of NFTs owned by user
 */
export function useUserNFTCount(userId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'userNFTCount',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) },
    })
}

/**
 * Get package top-up count for user
 */
export function usePackageTopUpCount(userId: bigint | undefined, packageId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'packageTopUpCount',
        args: userId && packageId ? [userId, packageId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) && !!packageId && packageId > BigInt(0) },
    })
}
