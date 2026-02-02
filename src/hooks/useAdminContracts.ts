'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS } from '@/config/constants'
import { BullRunMainLogicABI, USDTbABI } from '@/abi'

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
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getWeeklyShareholders',
        args: week ? [week] : undefined,
        query: { enabled: !!week }
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
            args: [CONTRACTS.BULL_RUN, parseUnits(amount, 18)],
        })
    }

    const approveMax = () => {
        writeContract({
            address: CONTRACTS.USDT,
            abi: USDTbABI,
            functionName: 'approve',
            args: [CONTRACTS.BULL_RUN, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
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
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [poolType],
    })
}

/**
 * Get all pool balances at once
 */
export function useAllPoolBalances() {
    const weekly = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [PoolType.WEEKLY_POOL],
    })
    const luckyDraw = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [PoolType.LUCKY_DRAW_POOL],
    })
    const rankEmi = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [PoolType.RANK_EMI_POOL],
    })
    const trip = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [PoolType.TRIP_POOL],
    })
    const buysell = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'getPoolBalance',
        args: [PoolType.BUYSELL_POOL],
    })
    const buffer = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
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
 * Add funds to any pool (admin only)
 */
export function useAddToPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const addToPool = (poolType: PoolType, amount: string) => {
        const amountWei = parseUnits(amount, 18)
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'addToPool',
            args: [poolType, amountWei],
        })
    }

    return { addToPool, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Withdraw funds from any pool (admin only)
 */
export function useWithdrawFromAnyPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const withdrawFromAnyPool = (poolType: PoolType, amount: string, recipient: `0x${string}`) => {
        const amountWei = parseUnits(amount, 18)
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'withdrawFromPool',
            args: [poolType, amountWei, recipient],
        })
    }

    return { withdrawFromAnyPool, hash, isPending, isConfirming, isSuccess, error }
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
