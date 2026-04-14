'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePublicClient, useBlockNumber } from 'wagmi'
import { getContractEvents } from 'viem/actions'
import { CONTRACTS, DEPLOY_BLOCK } from '@/config/constants'
import { BullRunMainLogicABI } from '@/abi'
import { PublicClient, Log } from 'viem'

// opBNB Mainnet has a 50k block range limit for eth_getLogs
const MAX_BLOCK_RANGE = BigInt(45000)

// opBNB block time is ~1 second, so ~86400 blocks per day
const BLOCKS_PER_DAY = BigInt(86400)

/**
 * Calculate block range for a date (defaults to last 24 hours)
 */
function getBlockRangeForDate(currentBlock: bigint | undefined, daysBack: number = 0): { fromBlock: bigint; toBlock: bigint } {
    if (!currentBlock) {
        return { fromBlock: DEPLOY_BLOCK, toBlock: DEPLOY_BLOCK }
    }

    const toBlock = currentBlock
    const blocksBack = BLOCKS_PER_DAY * BigInt(daysBack + 1) // +1 to include full day
    const fromBlock = toBlock > blocksBack ? toBlock - blocksBack : DEPLOY_BLOCK

    return { fromBlock, toBlock }
}

/**
 * Fetch events in chunks of 45k blocks (opBNB mainnet limit is 50k)
 * This enables fetching complete history without RPC errors
 */
async function fetchEventsInChunks(
    publicClient: PublicClient,
    params: {
        address: `0x${string}`
        abi: any  // Using any to avoid TypeScript ABI type issues
        eventName: string
        args?: Record<string, unknown>
        fromBlock: bigint
        toBlock: bigint
    }
): Promise<Log[]> {
    const { fromBlock, toBlock, ...restParams } = params
    const allLogs: Log[] = []

    let currentFrom = fromBlock
    while (currentFrom < toBlock) {
        const currentTo = currentFrom + MAX_BLOCK_RANGE > toBlock
            ? toBlock
            : currentFrom + MAX_BLOCK_RANGE

        try {
            const logs = await getContractEvents(publicClient, {
                ...restParams,
                fromBlock: currentFrom,
                toBlock: currentTo,
            } as any)
            allLogs.push(...(logs as Log[]))
        } catch (err) {
            console.warn(`[fetchEventsInChunks] Chunk ${currentFrom}-${currentTo} failed:`, err)
            // Continue with next chunk
        }

        currentFrom = currentTo + BigInt(1)
    }

    return allLogs
}

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

export interface WeeklyPoolPaidEvent {
    userId: bigint
    week: bigint
    amount: bigint
    shares: bigint
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

export interface NFTBurnedEvent {
    nftId: bigint
    buyerId: bigint
    finalPrice: bigint
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

// ============ INCOME EVENTS ============


/**
 * Get all income received by a user (DIRECT_SPONSOR, LEVEL_INCOME, TRADING_LEVEL, NFT_SELLER)
 * @param daysBack Number of days back to fetch (0 = today only, default)
 */
export function useIncomeEvents(userId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<IncomeEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!publicClient || !userId || userId === BigInt(0) || !currentBlock) {
            setEvents([])
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'IncomeDistributed',
                args: { toUserId: userId },
                fromBlock,
                toBlock,
            })
            console.log('[useIncomeEvents] Found logs:', logs.length, `(last ${daysBack + 1} days)`)

            const parsed: IncomeEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    toUserId: args.toUserId as bigint,
                    fromUserId: args.fromUserId as bigint,
                    fromUsernameId: args.fromUsernameId as bigint,
                    amount: args.amount as bigint,
                    incomeType: args.incomeType as string,
                    level: args.level as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            console.error('[useIncomeEvents] Error:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock, daysBack])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ NFT TRADING EVENTS ============

/**
 * Get NFTs bought by a user
 * @param daysBack Number of days back to fetch (0 = last 24h, default)
 */
export function useNFTBuyEvents(buyerId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<NFTSoldEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!buyerId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTSold',
                args: { buyerId },
                fromBlock,
                toBlock,
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
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [buyerId, publicClient, currentBlock, daysBack])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get NFTs sold by a user
 * @param daysBack Number of days back to fetch (0 = last 24h, default)
 */
export function useNFTSellEvents(sellerId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<NFTSoldEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!sellerId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTSold',
                args: { sellerId },
                fromBlock,
                toBlock,
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
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [sellerId, publicClient, currentBlock, daysBack])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get NFT burned events for a user (as buyer of $200 NFT)
 * @param daysBack Number of days back to fetch (0 = last 24h, default)
 */
export function useNFTBurnedEvents(buyerId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<NFTBurnedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!buyerId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTBurned',
                args: { buyerId },
                fromBlock,
                toBlock,
            })

            const parsed: NFTBurnedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    nftId: args.nftId as bigint,
                    buyerId: args.buyerId as bigint,
                    finalPrice: args.finalPrice as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [buyerId, publicClient, currentBlock, daysBack])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// NFT Split event - when NFT is split into multiple new NFTs
export interface NFTSplitEvent {
    originalNftId: bigint
    buyerId: bigint
    splitPrice: bigint
    newNftIds: bigint[]
    blockNumber: bigint
    transactionHash: `0x${string}`
}

/**
 * Get NFT Split events for a user (NFTs received from splits)
 */
export function useNFTSplitEvents(buyerId: bigint | undefined) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<NFTSplitEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!buyerId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'NFTSplit',
                args: { buyerId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: NFTSplitEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    originalNftId: args.originalNftId as bigint,
                    buyerId: args.buyerId as bigint,
                    splitPrice: args.splitPrice as bigint,
                    newNftIds: args.newNftIds as bigint[],
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [buyerId, publicClient, currentBlock])

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
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<RankEmiClaimedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'RankEmiClaimed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: RankEmiClaimedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    rank: Number(args.rank),
                    emiNumber: args.emiNumber as bigint,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

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
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<FastBonusClaimedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'FastBonusClaimed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: FastBonusClaimedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    rank: Number(args.rank),
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ WITHDRAWAL EVENTS ============

/**
 * Get all withdrawals by a user
 * @param daysBack Number of days back to fetch (0 = last 24h, default)
 */
export function useWithdrawnEvents(userId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<WithdrawnEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'Withdrawn',
                args: { userId },
                fromBlock,
                toBlock,
            })

            const parsed: WithdrawnEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    wallet: args.wallet as `0x${string}`,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock, daysBack])

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
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<SharesAwardedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'SharesAwarded',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: SharesAwardedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    shares: args.shares as bigint,
                    reason: args.reason as string,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get weekly pool payouts received by a user
 */
export function useWeeklyPoolPaidEvents(userId: bigint | undefined) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<WeeklyPoolPaidEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return
        setIsLoading(true)
        setError(null)

        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'WeeklyPoolPaid',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedEvents: WeeklyPoolPaidEvent[] = logs.map((log: any) => {
                const args = log.args;
                return {
                    userId: args.userId as bigint,
                    week: args.week as bigint,
                    amount: args.amount as bigint,
                    shares: args.shares as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                };
            })

            setEvents(formattedEvents)
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

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
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<LuckyDrawWinnerEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'LuckyDrawWinner',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: LuckyDrawWinnerEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    week: args.week as bigint,
                    prize: args.prize as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get all lucky draw entries for current week (for admin - get participants)
 */
export interface LuckyDrawEntryEvent {
    userId: bigint
    week: bigint
    entries: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

export function useLuckyDrawEntryEvents(week: bigint | undefined) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<LuckyDrawEntryEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!week || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'LuckyDrawEntry',
                args: { week },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: LuckyDrawEntryEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    week: args.week as bigint,
                    entries: args.entries as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            // Aggregate entries per user
            const userEntries = new Map<string, LuckyDrawEntryEvent>()
            parsed.forEach(event => {
                const key = event.userId.toString()
                const existing = userEntries.get(key)
                if (existing) {
                    existing.entries += event.entries
                } else {
                    userEntries.set(key, { ...event })
                }
            })

            setEvents(Array.from(userEntries.values()).sort((a, b) =>
                Number(b.entries - a.entries)  // Sort by entries descending
            ))
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [week, publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Get all lucky draw winners (for admin history)
 */
export function useAllLuckyDrawWinners() {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<LuckyDrawWinnerEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'LuckyDrawWinner',
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: LuckyDrawWinnerEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    week: args.week as bigint,
                    prize: args.prize as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())  // Most recent first
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

// ============ PACKAGE EVENTS ============


/**
 * Get package purchases by a user
 * @param daysBack Number of days back to fetch (0 = last 24h, default)
 */
export function usePackagePurchasedEvents(userId: bigint | undefined, daysBack: number = 0) {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<PackagePurchasedEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const { fromBlock, toBlock } = getBlockRangeForDate(currentBlock, daysBack)
            
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'PackagePurchased',
                args: { userId },
                fromBlock,
                toBlock,
            })

            const parsed: PackagePurchasedEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    packageLevel: args.packageLevel as bigint,
                    price: args.price as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock, daysBack])

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
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<TripRewardEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!userId || !publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'TripRewardDistributed',
                args: { userId },
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })

            const parsed: TripRewardEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    amount: args.amount as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed.reverse())
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [userId, publicClient, currentBlock])

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

// ============ USER REGISTRATION EVENTS ============

export interface UserRegisteredEvent {
    userId: bigint
    wallet: `0x${string}`
    referrerId: bigint
    usernameId: bigint
    blockNumber: bigint
    transactionHash: `0x${string}`
}

/**
 * Get all user registration events (for building referral tree)
 */
export function useAllUserRegisteredEvents() {
    const publicClient = usePublicClient()
    const { data: currentBlock } = useBlockNumber()
    const [events, setEvents] = useState<UserRegisteredEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchEvents = useCallback(async () => {
        if (!publicClient || !currentBlock) return

        setIsLoading(true)
        setError(null)
        try {
            console.log('[useAllUserRegisteredEvents] Fetching all registration events...')
            const logs = await fetchEventsInChunks(publicClient as PublicClient, {
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                eventName: 'UserRegistered',
                fromBlock: DEPLOY_BLOCK,
                toBlock: currentBlock,
            })
            console.log('[useAllUserRegisteredEvents] Found', logs.length, 'events')

            const parsed: UserRegisteredEvent[] = logs.map(log => {
                const args = (log as any).args
                return {
                    userId: args.userId as bigint,
                    wallet: args.wallet as `0x${string}`,
                    referrerId: args.referrerId as bigint,
                    usernameId: args.usernameId as bigint,
                    blockNumber: log.blockNumber!,
                    transactionHash: log.transactionHash!,
                }
            })

            setEvents(parsed)
        } catch (err) {
            console.error('[useAllUserRegisteredEvents] Error:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [publicClient, currentBlock])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    return { events, isLoading, error, refetch: fetchEvents }
}

/**
 * Calculate level-wise team counts for a user using registration events
 * Returns a Map where key = level (1-30) and value = count of users at that level
 */
export function useLevelCounts(targetUserId: bigint | undefined) {
    const { events: registrationEvents, isLoading: eventsLoading } = useAllUserRegisteredEvents()
    const [levelCounts, setLevelCounts] = useState<Map<number, number>>(new Map())
    const [totalTeam, setTotalTeam] = useState(0)
    const [isCalculating, setIsCalculating] = useState(false)

    useEffect(() => {
        if (!targetUserId || registrationEvents.length === 0) {
            setLevelCounts(new Map())
            setTotalTeam(0)
            return
        }

        setIsCalculating(true)

        // Build referrer map: userId -> referrerId
        const referrerMap = new Map<bigint, bigint>()
        registrationEvents.forEach(event => {
            referrerMap.set(event.userId, event.referrerId)
        })

        // For each registered user, walk up their referrer chain
        // If we find targetUserId in their upline, increment the level count
        const counts = new Map<number, number>()
        let total = 0

        registrationEvents.forEach(event => {
            const userId = event.userId
            if (userId === targetUserId) return // Skip self

            let currentId = event.referrerId
            let level = 1

            // Walk up to 30 levels
            while (currentId !== BigInt(0) && level <= 30) {
                if (currentId === targetUserId) {
                    // Found target user in upline at this level
                    counts.set(level, (counts.get(level) || 0) + 1)
                    total++
                    break
                }
                currentId = referrerMap.get(currentId) || BigInt(0)
                level++
            }
        })

        setLevelCounts(counts)
        setTotalTeam(total)
        setIsCalculating(false)

    }, [targetUserId, registrationEvents])

    return {
        levelCounts,
        totalTeam,
        isLoading: eventsLoading || isCalculating,
        getLevelCount: (level: number) => levelCounts.get(level) || 0
    }
}

