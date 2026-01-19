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
 * Get package info by ID
 */
export function usePackage(packageId: bigint | undefined) {
    return useReadContract({
        address: contracts.bullRun,
        abi: BullRunMainLogicABI,
        functionName: 'packages',
        args: packageId ? [packageId] : undefined,
        query: { enabled: !!packageId && packageId > BigInt(0) },
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
