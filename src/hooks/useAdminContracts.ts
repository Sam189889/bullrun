'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS } from '@/config/constants'
import { BullRunMainLogicABI, USDTbABI } from '@/abi'

// ============ READ HOOKS ============

/**
 * Get pool balance
 */
export function usePoolBalance() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'poolBalance',
    })
}

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
 * Get current week number
 */
export function useCurrentWeek() {
    return useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'currentWeek',
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
 * Distribute weekly pool
 */
export function useDistributeWeeklyPool() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const distribute = (userIds: bigint[]) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'distributeWeeklyPool',
            args: [userIds],
        })
    }

    return { distribute, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Start new week
 */
export function useStartNewWeek() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const startNewWeek = () => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'startNewWeek',
        })
    }

    return { startNewWeek, hash, isPending, isConfirming, isSuccess, error }
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
 * Create NFT
 */
export function useCreateNFT() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const createNFT = (basePrice: string) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'createNFT',
            args: [parseUnits(basePrice, 18)],
        })
    }

    return { createNFT, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set NFT split settings
 */
export function useSetSplitSettings() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setSplitSettings = (threshold: string, count: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setSplitSettings',
            args: [parseUnits(threshold, 18), count],
        })
    }

    return { setSplitSettings, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Toggle NFT featured status
 */
export function useToggleNFTFeatured() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const toggleFeatured = (nftId: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'toggleNFTFeatured',
            args: [nftId],
        })
    }

    return { toggleFeatured, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Toggle NFT hidden status
 */
export function useToggleNFTHidden() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const toggleHidden = (nftId: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'toggleNFTHidden',
            args: [nftId],
        })
    }

    return { toggleHidden, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Set NFT display order
 */
export function useSetNFTDisplayOrder() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const setOrder = (nftId: bigint, order: bigint) => {
        writeContract({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'setNFTDisplayOrder',
            args: [nftId, order],
        })
    }

    return { setOrder, hash, isPending, isConfirming, isSuccess, error }
}
