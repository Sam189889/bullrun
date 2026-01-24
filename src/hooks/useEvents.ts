'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { getContractEvents } from 'viem/actions'
import { CONTRACTS, DEPLOY_BLOCK } from '@/config/constants'
import { BullRunMainLogicABI } from '@/abi'

// Event types for type safety
export interface IncomeEvent {
    toUserId: bigint
    fromUserId: bigint
    fromUsernameId: bigint  // NEW: Username ID for display
    amount: bigint
    incomeType: string
    level: bigint  // NEW: Level number for LEVEL_INCOME
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface NFTSoldEvent {
    nftId: bigint
    sellerId: bigint
    buyerId: bigint
    sellerUsernameId: bigint  // NEW: Seller username
    buyerUsernameId: bigint   // NEW: Buyer username
    price: bigint
    appreciation: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface TripRewardEvent {
    userId: bigint
    amount: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface RankEmiClaimedEvent {
    userId: bigint
    rank: number
    emiNumber: bigint
    amount: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface FastBonusClaimedEvent {
    userId: bigint
    rank: number
    amount: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface WithdrawnEvent {
    userId: bigint
    wallet: `0x${string}`
    amount: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface SharesAwardedEvent {
    userId: bigint
    shares: bigint
    reason: string
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface LuckyDrawWinnerEvent {
    userId: bigint
    week: bigint
    prize: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export interface PackagePurchasedEvent {
    userId: bigint
    packageLevel: bigint
    price: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

// ============ INCOME EVENTS ============

/**
 * Get all income received by a user (DIRECT_SPONSOR, LEVEL_INCOME, TRADING_LEVEL, NFT_SELLER)
 */
export function useIncomeEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<IncomeEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            console.log('[useIncomeEvents] Fetching for userId:', userId.toString())
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'IncomeDistributed',
                args: { toUserId: userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })
            console.log('[useIncomeEvents] Raw logs:', logs)

            const parsed: IncomeEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    toUserId: args.toUserId as bigint,
                    fromUserId: args.fromUserId as bigint,
                    fromUsernameId: args.fromUsernameId as bigint,
                    amount: args.amount as bigint,
                    incomeType: args.incomeType as string,
                    level: args.level as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })
            console.log('[useIncomeEvents] Parsed:', parsed)

            setEvents(parsed.reverse())
        } catch (err) {
            console.error('[useIncomeEvents] Error:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ NFT TRADING EVENTS ============

/**
 * Get NFTs bought by a user
 */
export function useNFTBuyEvents(buyerId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<NFTSoldEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!buyerId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTSold',
                args: { buyerId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: NFTSoldEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    nftId: args.nftId as bigint,
                    sellerId: args.sellerId as bigint,
                    buyerId: args.buyerId as bigint,
                    sellerUsernameId: args.sellerUsernameId as bigint,
                    buyerUsernameId: args.buyerUsernameId as bigint,
                    price: args.price as bigint,
                    appreciation: args.appreciation as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [buyerId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get NFTs sold by a user
 */
export function useNFTSellEvents(sellerId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<NFTSoldEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!sellerId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTSold',
                args: { sellerId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: NFTSoldEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    nftId: args.nftId as bigint,
                    sellerId: args.sellerId as bigint,
                    buyerId: args.buyerId as bigint,
                    sellerUsernameId: args.sellerUsernameId as bigint,
                    buyerUsernameId: args.buyerUsernameId as bigint,
                    price: args.price as bigint,
                    appreciation: args.appreciation as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [sellerId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ RANK EVENTS ============

/**
 * Get Rank EMI claimed by a user
 */
export function useRankEmiClaimedEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<RankEmiClaimedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'RankEmiClaimed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: RankEmiClaimedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    rank: Number(args.rank),
                    emiNumber: args.emiNumber as bigint,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get Fast Bonus claimed by a user
 */
export function useFastBonusClaimedEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<FastBonusClaimedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'FastBonusClaimed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: FastBonusClaimedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    rank: Number(args.rank),
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ WITHDRAWAL EVENTS ============

/**
 * Get all withdrawals by a user
 */
export function useWithdrawnEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<WithdrawnEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'Withdrawn',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: WithdrawnEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    wallet: args.wallet as `0x${string}`,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ WEEKLY POOL EVENTS ============

/**
 * Get weekly shares awarded to a user
 */
export function useSharesAwardedEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<SharesAwardedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'SharesAwarded',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: SharesAwardedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    shares: args.shares as bigint,
                    reason: args.reason as string,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ LUCKY DRAW EVENTS ============

/**
 * Get lucky draw wins by a user
 */
export function useLuckyDrawWinnerEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<LuckyDrawWinnerEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'LuckyDrawWinner',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: LuckyDrawWinnerEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    week: args.week as bigint,
                    prize: args.prize as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ PACKAGE EVENTS ============

/**
 * Get package purchases by a user
 */
export function usePackagePurchasedEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<PackagePurchasedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'PackagePurchased',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: PackagePurchasedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    packageLevel: args.packageLevel as bigint,
                    price: args.price as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ COMBINED HISTORY ============

export type HistoryEventType =
    | 'INCOME_RECEIVED'
    | 'NFT_BOUGHT'
    | 'NFT_SOLD'
    | 'RANK_EMI'
    | 'FAST_BONUS'
    | 'WITHDRAWAL'
    | 'SHARES_AWARDED'
    | 'LUCKY_DRAW_WIN'
    | 'PACKAGE_PURCHASED'

export interface HistoryEvent {
    type: HistoryEventType
    amount: bigint
    details: string
    blockNumber: bigint
    transactionHash: `0x${string}`
}

/**
 * Get trip reward events for a user
 */
export function useTripRewardEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const [events, setEvents] = useState<TripRewardEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await getContractEvents(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'TripRewardDistributed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: 'latest',
            })

            const parsed: TripRewardEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get combined history of all events for a user
 */
export function useUserHistory(userId: bigint | undefined) {
    const { events: incomeEvents, isLoading: incomeLoading } = useIncomeEvents(userId)
    const { events: buyEvents, isLoading: buyLoading } = useNFTBuyEvents(userId)
    const { events: sellEvents, isLoading: sellLoading } = useNFTSellEvents(userId)
    const { events: emiEvents, isLoading: emiLoading } = useRankEmiClaimedEvents(userId)
    const { events: fastBonusEvents, isLoading: fastLoading } = useFastBonusClaimedEvents(userId)
    const { events: withdrawEvents, isLoading: withdrawLoading } = useWithdrawnEvents(userId)
    const { events: sharesEvents, isLoading: sharesLoading } = useSharesAwardedEvents(userId)
    const { events: luckyEvents, isLoading: luckyLoading } = useLuckyDrawWinnerEvents(userId)
    const { events: packageEvents, isLoading: packageLoading } = usePackagePurchasedEvents(userId)

    const isLoading = incomeLoading || buyLoading || sellLoading || emiLoading ||
        fastLoading || withdrawLoading || sharesLoading || luckyLoading || packageLoading

    // Combine all events
    const allEvents: HistoryEvent[] = [
        ...incomeEvents.map(e => ({
            type: 'INCOME_RECEIVED' as HistoryEventType,
            amount: e.amount,
            details: `${e.incomeType} from User #${e.fromUserId}`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...buyEvents.map(e => ({
            type: 'NFT_BOUGHT' as HistoryEventType,
            amount: e.price,
            details: `NFT #${e.nftId} from User #${e.sellerId}`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...sellEvents.map(e => ({
            type: 'NFT_SOLD' as HistoryEventType,
            amount: e.price,
            details: `NFT #${e.nftId} to User #${e.buyerId}`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...emiEvents.map(e => ({
            type: 'RANK_EMI' as HistoryEventType,
            amount: e.amount,
            details: `Rank ${e.rank} EMI #${e.emiNumber}`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...fastBonusEvents.map(e => ({
            type: 'FAST_BONUS' as HistoryEventType,
            amount: e.amount,
            details: `Rank ${e.rank} Fast Bonus`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...withdrawEvents.map(e => ({
            type: 'WITHDRAWAL' as HistoryEventType,
            amount: e.amount,
            details: `Withdrawn to ${e.wallet.slice(0, 6)}...`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...sharesEvents.map(e => ({
            type: 'SHARES_AWARDED' as HistoryEventType,
            amount: e.shares,
            details: e.reason,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...luckyEvents.map(e => ({
            type: 'LUCKY_DRAW_WIN' as HistoryEventType,
            amount: e.prize,
            details: `Week ${e.week} Lucky Draw Win!`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
        ...packageEvents.map(e => ({
            type: 'PACKAGE_PURCHASED' as HistoryEventType,
            amount: e.price,
            details: `Package Level ${e.packageLevel}`,
            blockNumber: e.blockNumber,
            transactionHash: e.transactionHash,
        })),
    ]

    // Sort by block number (latest first)
    allEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber))

    return { events: allEvents, isLoading }
}
