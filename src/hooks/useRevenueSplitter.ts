import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '@/config/constants'
import RevenueSplitterABI from '@/abi/RevenueSplitter.json'

// ============ READ HOOKS ============

/**
 * Get all shareholders with their shares and total paid
 */
export function useGetAllShareholders() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'getAllShareholders',
    })
}

/**
 * Get pending balance to be distributed
 */
export function usePendingBalance() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'pendingBalance',
    })
}

/**
 * Get total share percent configured
 */
export function useTotalSharePercent() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'totalSharePercent',
    })
}

/**
 * Get total distributed amount
 */
export function useTotalDistributed() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'totalDistributed',
    })
}

/**
 * Check if splitter is configured (shares = 100%)
 */
export function useIsConfigured() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'isConfigured',
    })
}

/**
 * Get deployer address
 */
export function useDeployer() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'deployer',
    })
}

/**
 * Get admin address
 */
export function useSplitterAdmin() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'admin',
    })
}

/**
 * Preview distribution amounts
 */
export function usePreviewDistribution() {
    return useReadContract({
        address: CONTRACTS.REVENUE_SPLITTER,
        abi: RevenueSplitterABI,
        functionName: 'previewDistribution',
    })
}

// ============ WRITE HOOKS ============

/**
 * Add a shareholder
 */
export function useAddShareholder() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const addShareholder = (wallet: `0x${string}`, sharePercent: bigint) => {
        writeContract({
            address: CONTRACTS.REVENUE_SPLITTER,
            abi: RevenueSplitterABI,
            functionName: 'addShareholder',
            args: [wallet, sharePercent],
        })
    }

    return { addShareholder, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Remove a shareholder
 */
export function useRemoveShareholder() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const removeShareholder = (wallet: `0x${string}`) => {
        writeContract({
            address: CONTRACTS.REVENUE_SPLITTER,
            abi: RevenueSplitterABI,
            functionName: 'removeShareholder',
            args: [wallet],
        })
    }

    return { removeShareholder, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Update shareholder's share
 */
export function useUpdateShare() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const updateShare = (wallet: `0x${string}`, newSharePercent: bigint) => {
        writeContract({
            address: CONTRACTS.REVENUE_SPLITTER,
            abi: RevenueSplitterABI,
            functionName: 'updateShare',
            args: [wallet, newSharePercent],
        })
    }

    return { updateShare, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Batch add shareholders (replaces all existing)
 */
export function useBatchAddShareholders() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const batchAddShareholders = (wallets: `0x${string}`[], shares: bigint[]) => {
        writeContract({
            address: CONTRACTS.REVENUE_SPLITTER,
            abi: RevenueSplitterABI,
            functionName: 'batchAddShareholders',
            args: [wallets, shares],
        })
    }

    return { batchAddShareholders, hash, isPending, isConfirming, isSuccess, error }
}

/**
 * Distribute funds to all shareholders
 */
export function useDistribute() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const distribute = () => {
        writeContract({
            address: CONTRACTS.REVENUE_SPLITTER,
            abi: RevenueSplitterABI,
            functionName: 'distribute',
        })
    }

    return { distribute, hash, isPending, isConfirming, isSuccess, error }
}
