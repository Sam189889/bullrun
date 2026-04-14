'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS } from '@/config/constants'
import { BullRunMainLogicABI, BullRunHubABI, USDTbABI } from '@/abi'

// ============ READ HOOKS ============

/**
 * Get weekly pool balance
 */
export function useWeeklyPoolBalance() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'weeklyPoolBalance',
    })
}

/**
 * Get total weekly shares
 */
export function useTotalWeeklyShares() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'totalWeeklyShares',
    })
}

/**
 * Get current week number (manual mode value)
 */
export function useCurrentWeek() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'currentWeek',
    })
}

/**
 * Get current week number (auto-calculated or manual)
 */
export function useGetCurrentWeek() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getCurrentWeek',
    })
}

/**
 * Get week start timestamp
 */
export function useWeekStartTimestamp() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'weekStartTimestamp',
    })
}


/**
 * Get lucky draw pool info
 */
export function useLuckyDrawPool() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'luckyDrawPool',
    })
}

/**
 * Check if a week's pool has been distributed
 */
export function useWeekDistributed(week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'weekDistributed',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
    })
}

/**
 * Get weekly pool amount for a specific week
 */
export function useWeeklyPoolPerWeek(week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'weeklyPoolPerWeek',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
    })
}

/**
 * Check if a week's lucky draw has been done
 */
export function useWeekLuckyDrawn(week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'weekLuckyDrawn',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
    })
}

/**
 * Get lucky draw pool amount for a specific week
 */
export function useLuckyDrawPoolPerWeek(week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'luckyDrawPoolPerWeek',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
    })
}

/**
 * Get total users count
 */
export function useTotalUsers() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'totalUsers',
    })
}

/**
 * Get package ID counter
 */
export function usePackageIdCounter() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'packageIdCounter',
    })
}

/**
 * Get first user address
 */
export function useFirstUser() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'firstUser',
    })
}

/**
 * Get contract version
 */
export function useContractVersion() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'version',
    })
}

/**
 * Get current USDT token address
 */
export function useUSDTAddress() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'USDT',
    })
}

/**
 * Get current creator wallet address
 */
export function useCreatorWallet() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'creatorWallet',
    })
}

/**
 * Get total NFTs
 */
export function useTotalNFTs() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'totalNFTs',
    })
}

/**
 * Get NFT by ID
 */
export function useNFT(nftId: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'nfts',
        args: nftId !== undefined ? [nftId] : undefined,
        query: { enabled: nftId !== undefined }
    })
}

/**
 * Get NFT split threshold
 */
export function useNFTSplitThreshold() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'nftSplitThreshold',
    })
}

/**
 * Get NFT split count
 */
export function useNFTSplitCount() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'nftSplitCount',
    })
}

/**
 * Get NFT appreciation bps
 */
export function useNFTAppreciationBps() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'nftAppreciationBps',
    })
}

// ============ WRITE HOOKS ============

/**
 * Toggle package active status
 */
export function useTogglePackageStatus() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const togglePackageStatus = (packageId: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'togglePackageStatus',
            args: [packageId],
        })
    }

    return { togglePackageStatus, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Deposit to pool
 */
export function useDepositToPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const depositToPool = (amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'depositToPool',
            args: [parseUnits(amount, 18)],
        })
    }

    return { depositToPool, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Withdraw from pool
 */
export function useWithdrawFromPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const withdrawFromPool = (to: `0x${string}`, amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'withdrawFromPool',
            args: [to, parseUnits(amount, 18)],
        })
    }

    return { withdrawFromPool, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set distribution wallets
 */
export function useSetWallets() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setWallets = (
        buffer: `0x${string}`,
        creator: `0x${string}`,
        trip: `0x${string}`,
        luckyDraw: `0x${string}`
    ) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setWallets',
            args: [buffer, creator, trip, luckyDraw],
        })
    }

    return { setWallets, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set first user (root user)
 */
export function useSetFirstUser() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setFirstUser = (address: `0x${string}`) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setFirstUser',
            args: [address],
        })
    }

    return { setFirstUser, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set payment token (USDT address)
 */
export function useSetPaymentToken() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setPaymentToken = (tokenAddress: `0x${string}`) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setPaymentToken',
            args: [tokenAddress],
        })
    }

    return { setPaymentToken, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Add to weekly pool
 */
export function useAddToWeeklyPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const addToWeeklyPool = (amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'addToWeeklyPool',
            args: [parseUnits(amount, 18)],
        })
    }

    return { addToWeeklyPool, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Distribute weekly pool (no params needed - uses stored shareholders array)
 */
export function useDistributeWeeklyPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const distribute = () => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'distributeWeeklyPool',
            args: [],
        })
    }

    return { distribute, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Get weekly shareholders for a specific week
 */
export function useGetWeeklyShareholders(week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getWeeklyShareholders',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
    })
}

/**
 * Get user's weekly shares for a specific week
 */
export function useUserWeeklyShares(userId: bigint | undefined, week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'userWeeklyShares',
        args: userId && week ? [userId, week] : undefined,
        query: { enabled: !!(userId && week) }
    })
}

/**
 * Approve USDT for contract (needed before deposits)
 */
export function useApproveUSDT() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const approve = (amount: string) => {
        writeContract({
            address: CONTRACTS.USDT,
            abi: USDTbABI,
            functionName: 'approve',
            args: [CONTRACTS.BULL_RUN_VIEW, parseUnits(amount, 18)], // Approve to Hub
        })
    }

    const approveMax = () => {
        writeContract({
            address: CONTRACTS.USDT,
            abi: USDTbABI,
            functionName: 'approve',
            args: [CONTRACTS.BULL_RUN_VIEW, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')], // Approve to Hub
        })
    }

    return { approve, approveMax, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Create NFT(s) - supports batch creation
 */
export function useCreateNFT() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const createNFT = (basePrice: string, count: number = 1) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'createNFT',
            args: [parseUnits(basePrice, 18), BigInt(count)],
        })
    }

    return { createNFT, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set NFT split count
 */
export function useSetSplitCount() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setSplitCount = (count: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setSplitCount',
            args: [count],
        })
    }

    return { setSplitCount, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set NFT queue count (admin only)
 */
export function useSetQueueCount() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setQueueCount = (count: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setQueueCount',
            args: [count],
        })
    }

    return { setQueueCount, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Get NFT queue count
 */
export function useNFTQueueCount() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'nftQueueCount',
    })
}

/**
 * Draw lucky winner (admin only)
 */
export function useDrawLuckyWinner() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const drawWinner = (participantIds: bigint[]) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'drawLuckyWinner',
            args: [participantIds],
        })
    }

    return { drawWinner, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set global weekly share pool balance (admin only)
 */
export function useSetWeeklyPoolGlobalBalance() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setWeeklyPoolGlobalBalance = (amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setWeeklyPoolGlobalBalance',
            args: [parseUnits(amount, 18)],
        })
    }

    return { setWeeklyPoolGlobalBalance, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set global lucky draw pool balance (admin only)
 */
export function useSetLuckyDrawPoolGlobalBalance() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setLuckyDrawPoolGlobalBalance = (amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setLuckyDrawPoolGlobalBalance',
            args: [parseUnits(amount, 18)],
        })
    }

    return { setLuckyDrawPoolGlobalBalance, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set weekly share pool amount for a specific week (admin only)
 */
export function useSetWeeklyPoolAmount() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setWeeklyPoolAmount = (week: bigint, amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setWeeklyPoolAmount',
            args: [week, parseUnits(amount, 18)],
        })
    }

    return { setWeeklyPoolAmount, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set lucky draw pool amount for a specific week (admin only)
 */
export function useSetLuckyDrawPoolAmount() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setLuckyDrawPoolAmount = (week: bigint, amount: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setLuckyDrawPoolAmount',
            args: [week, parseUnits(amount, 18)],
        })
    }

    return { setLuckyDrawPoolAmount, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Get current day start timestamp
 */
export function useDayStartTimestamp() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'dayStartTimestamp',
    })
}

/**
 * Get day length in seconds
 */
export function useDayLength() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'dayLength',
    })
}

/**
 * Get current day number
 */
export function useCurrentDay() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getCurrentDay',
    })
}

// ============ WEEK MANAGEMENT HOOKS ============

/**
 * Set week start timestamp (auto mode for both Share Pool & Lucky Draw)
 */
export function useSetWeekStartTimestamp() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setStartTimestamp = (timestamp: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setWeekStartTimestamp',
            args: [timestamp],
        })
    }

    return { setStartTimestamp, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set day configuration for daily limit reset
 */
export function useSetDaySettings() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setDaySettings = (startTimestamp: bigint, dayLength: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setDaySettings',
            args: [startTimestamp, dayLength],
        })
    }

    return { setDaySettings, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set creator wallet address (calls setWallets in contract)
 */
export function useSetCreatorWallet() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setCreatorWallet = (creatorAddress: `0x${string}`) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setWallets',
            args: [creatorAddress],
        })
    }

    return { setCreatorWallet, hash, isPending, isConfirming, isSuccess, error }
}

// ============ UNIFIED POOL MANAGEMENT ============

/**
 * Pool types enum matching contract
 */
export enum PoolType {
    WEEKLY_POOL = 0,
    LUCKY_DRAW_POOL = 1,
    RANK_EMI_POOL = 2,
    TRIP_POOL = 3,
    BUYSELL_POOL = 4,
    BUFFER_POOL = 5,
}

/**
 * Get balance of any pool
 */
export function useGetPoolBalance(poolType: PoolType) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [poolType],
    })
}

/**
 * Get all pool balances at once
 */
export function useAllPoolBalances() {
    const weekly = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.WEEKLY_POOL],
    })
    const luckyDraw = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.LUCKY_DRAW_POOL],
    })
    const rankEmi = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.RANK_EMI_POOL],
    })
    const trip = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.TRIP_POOL],
    })
    const buysell = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.BUYSELL_POOL],
    })
    const buffer = useReadContract({
        address: CONTRACTS.BULL_RUN_VIEW,
        abi: BullRunHubABI,
        functionName: 'getPoolBalance',
        args: [PoolType.BUFFER_POOL],
    })

    return {
        weekly: weekly.data as bigint | undefined,
        luckyDraw: luckyDraw.data as bigint | undefined,
        rankEmi: rankEmi.data as bigint | undefined,
        trip: trip.data as bigint | undefined,
        buysell: buysell.data as bigint | undefined,
        buffer: buffer.data as bigint | undefined,
        isLoading: weekly.isLoading || luckyDraw.isLoading || rankEmi.isLoading || trip.isLoading || buysell.isLoading || buffer.isLoading,
        refetch: async () => {
            await Promise.all([
                weekly.refetch(),
                luckyDraw.refetch(),
                rankEmi.refetch(),
                trip.refetch(),
                buysell.refetch(),
                buffer.refetch(),
            ])
        }
    }
}

/**
 * Unified pool management hook (add or withdraw funds)
 * @param poolType - Type of pool to manage
 * @param amount - Amount in USDT (string)
 * @param isWithdraw - true for withdraw, false for deposit
 * @param recipient - Recipient address (required for withdraw)
 */
export function useManagePool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const managePool = (poolType: PoolType, amount: string, isWithdraw: boolean, recipient?: `0x${string}`) => {
        const amountWei = parseUnits(amount, 18)
        const recipientAddress = recipient || '0x0000000000000000000000000000000000000000'
        
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'managePool',
            args: [poolType, amountWei, isWithdraw, recipientAddress],
        })
    }

    return { managePool, hash, isPending, isConfirming, isSuccess, error }
}


/**
 * Distribute trip reward to single user (admin only)
 */
export function useDistributeTripReward() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const distributeTripReward = (userId: bigint, amount: string) => {
        const amountWei = parseUnits(amount, 18)
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'distributeTripReward',
            args: [userId, amountWei],
        })
    }

    return { distributeTripReward, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Get user lucky draw entries for specific week
 */
export function useUserLuckyDrawEntries(userId: bigint | undefined, week: bigint | undefined) {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'userLuckyDrawEntries',
        args: userId && week ? [userId, week] : undefined,
        query: { enabled: !!userId && !!week }
    })
}

// ============ DISTRIBUTION PERCENTAGES ============

/**
 * Get current distribution percentages
 */
export function useDistributionPercents() {
    const seller = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'sellerPercent',
    })
    const buffer = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'bufferPercent',
    })
    const levelBonus = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'levelBonusPercent',
    })
    const creator = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'creatorPercent',
    })
    const trip = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'tripPercent',
    })
    const luckyDraw = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'luckyDrawPercent',
    })

    return {
        seller: seller.data,
        buffer: buffer.data,
        levelBonus: levelBonus.data,
        creator: creator.data,
        trip: trip.data,
        luckyDraw: luckyDraw.data,
        isLoading: seller.isLoading || buffer.isLoading || levelBonus.isLoading || creator.isLoading || trip.isLoading || luckyDraw.isLoading,
    }
}

/**
 * Set distribution percentages (admin only)
 */
export function useSetDistributionPercents() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setDistributionPercents = (
        seller: number,
        buffer: number,
        levelBonus: number,
        creator: number,
        trip: number,
        luckyDraw: number
    ) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setDistributionPercents',
            args: [BigInt(seller), BigInt(buffer), BigInt(levelBonus), BigInt(creator), BigInt(trip), BigInt(luckyDraw)],
        })
    }

    return { setDistributionPercents, hash, isPending, isConfirming, isSuccess, error }
}

// ============ BUFFER MANAGEMENT ============

/**
 * Get available buffer (unallocated contract funds)
 */
export function useAvailableBuffer() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getAvailableBuffer',
    })
}

/**
 * Withdraw available buffer (admin only)
 */
export function useWithdrawAvailableBuffer() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const withdrawAvailableBuffer = (recipient: `0x${string}`, amount: string) => {
        const amountWei = parseUnits(amount, 18)
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'withdrawAvailableBuffer',
            args: [recipient, amountWei],
        })
    }

    return { withdrawAvailableBuffer, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Burn all firstUser's NFTs (admin only, no input needed)
 */
export function useBurnAllFirstUserNFTs() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const burnAll = () => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'burnAllFirstUserNFTs',
        })
    }

    return { burnAll, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * List all queued/unlisted NFTs (admin only, no input needed)
 */
export function useListAllQueuedNFTs() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const listAll = () => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'listAllQueuedNFTs',
        })
    }

    return { listAll, hash, isPending, isConfirming, isSuccess, error }
}
