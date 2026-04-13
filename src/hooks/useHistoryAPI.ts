import { useState, useEffect, useCallback } from 'react';
import { USER_API_BASE_URL as API_BASE_URL } from '@/config/env';

/**
 * Database API History Hooks
 * Replacement for blockchain event hooks - fetches from MySQL via API
 */

// Event interfaces (matching useEvents.ts)
export interface PackagePurchasedEvent {
    userId: bigint;
    packageLevel: bigint;
    price: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface NFTSoldEvent {
    nftId: bigint;
    sellerId: bigint;
    buyerId: bigint;
    sellerUsernameId: bigint;
    buyerUsernameId: bigint;
    price: bigint;
    appreciation: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface NFTBurnedEvent {
    nftId: bigint;
    buyerId: bigint;
    finalPrice: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface WithdrawnEvent {
    userId: bigint;
    wallet: `0x${string}`;
    amount: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

// Income event interfaces
export interface IncomeEvent {
    userId: bigint;
    amount: bigint;
    incomeType: string;
    fromUserId?: bigint;
    fromUsernameId?: bigint;
    level?: number;
    nftId?: bigint;
    weekNumber?: number;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface RankEmiClaimedEvent {
    userId: bigint;
    rank: number;
    emiNumber: number;
    amount: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface FastBonusClaimedEvent {
    userId: bigint;
    rank: number;
    amount: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface TripRewardEvent {
    userId: bigint;
    amount: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface LuckyDrawWinnerEvent {
    userId: bigint;
    week: number;
    prize: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface WeeklyPoolPaidEvent {
    userId: bigint;
    week: number;
    shares: bigint;
    amount: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

/**
 * GET /api/user/:userId/history/packages
 * Returns: PackagePurchasedEvent[]
 */
export function usePackagePurchasedEvents(userId: bigint | undefined) {
    const [events, setEvents] = useState<PackagePurchasedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${userId}/history/packages`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Transform DB format to PackagePurchasedEvent format
            const parsed: PackagePurchasedEvent[] = data.transactions.map((tx: any) => {
                const eventData = typeof tx.event_data === 'string' 
                    ? JSON.parse(tx.event_data) 
                    : tx.event_data;

                return {
                    userId: BigInt(tx.user_id),
                    packageLevel: BigInt(eventData.packageLevel || 1),
                    price: BigInt(Math.floor(parseFloat(tx.amount) * 1e18)),
                    blockNumber: BigInt(tx.block_number),
                    transactionHash: tx.tx_hash as `0x${string}`,
                };
            });

            setEvents(parsed.reverse()); // Latest first
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * GET /api/user/:userId/history/trading
 * Returns: NFTSoldEvent[] (for both buy and sell)
 */
export function useNFTBuyEvents(buyerId: bigint | undefined) {
    const [events, setEvents] = useState<NFTSoldEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!buyerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${buyerId}/history/trading`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Filter only NFTPurchased events (where this user is buyer)
            const buyEvents = data.transactions.filter((tx: any) => tx.event_type === 'NFTPurchased');

            const parsed: NFTSoldEvent[] = buyEvents.map((tx: any) => {
                const eventData = typeof tx.event_data === 'string' 
                    ? JSON.parse(tx.event_data) 
                    : tx.event_data;

                return {
                    nftId: BigInt(tx.nft_id),
                    sellerId: BigInt(tx.related_user_id), // Seller
                    buyerId: BigInt(tx.user_id), // Buyer
                    sellerUsernameId: BigInt(eventData.sellerUsernameId || 0),
                    buyerUsernameId: BigInt(eventData.buyerUsernameId || 0),
                    price: BigInt(Math.floor(parseFloat(tx.amount) * 1e18)),
                    appreciation: BigInt(Math.floor(parseFloat(eventData.appreciation || 0) * 1e18)),
                    blockNumber: BigInt(tx.block_number),
                    transactionHash: tx.tx_hash as `0x${string}`,
                };
            });

            setEvents(parsed.reverse());
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [buyerId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * GET /api/user/:userId/history/trading
 * Returns: NFTSoldEvent[] (for sell events)
 */
export function useNFTSellEvents(sellerId: bigint | undefined) {
    const [events, setEvents] = useState<NFTSoldEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!sellerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${sellerId}/history/trading`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Filter only NFTSold events (where this user is seller)
            const sellEvents = data.transactions.filter((tx: any) => tx.event_type === 'NFTSold');

            const parsed: NFTSoldEvent[] = sellEvents.map((tx: any) => {
                const eventData = typeof tx.event_data === 'string' 
                    ? JSON.parse(tx.event_data) 
                    : tx.event_data;

                return {
                    nftId: BigInt(tx.nft_id),
                    sellerId: BigInt(tx.user_id), // Seller
                    buyerId: BigInt(tx.related_user_id), // Buyer
                    sellerUsernameId: BigInt(eventData.sellerUsernameId || 0),
                    buyerUsernameId: BigInt(eventData.buyerUsernameId || 0),
                    price: BigInt(Math.floor(parseFloat(tx.amount) * 1e18)),
                    appreciation: BigInt(Math.floor(parseFloat(eventData.appreciation || 0) * 1e18)),
                    blockNumber: BigInt(tx.block_number),
                    transactionHash: tx.tx_hash as `0x${string}`,
                };
            });

            setEvents(parsed.reverse());
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * GET /api/user/:userId/history/burning
 * Returns: NFTBurnedEvent[]
 */
export function useNFTBurnedEvents(buyerId: bigint | undefined) {
    const [events, setEvents] = useState<NFTBurnedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!buyerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${buyerId}/history/burning`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            const parsed: NFTBurnedEvent[] = data.transactions.map((tx: any) => {
                const eventData = typeof tx.event_data === 'string' 
                    ? JSON.parse(tx.event_data) 
                    : tx.event_data;

                return {
                    nftId: BigInt(tx.nft_id),
                    buyerId: BigInt(tx.user_id),
                    finalPrice: BigInt(Math.floor(parseFloat(eventData.finalPrice || tx.amount) * 1e18)),
                    blockNumber: BigInt(tx.block_number),
                    transactionHash: tx.tx_hash as `0x${string}`,
                };
            });

            setEvents(parsed.reverse());
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [buyerId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * GET /api/user/:userId/history/withdrawals
 * Returns: WithdrawnEvent[]
 */
export function useWithdrawnEvents(userId: bigint | undefined) {
    const [events, setEvents] = useState<WithdrawnEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${userId}/history/withdrawals`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            const parsed: WithdrawnEvent[] = data.transactions.map((tx: any) => {
                const eventData = typeof tx.event_data === 'string' 
                    ? JSON.parse(tx.event_data) 
                    : tx.event_data;

                return {
                    userId: BigInt(tx.user_id),
                    wallet: (eventData.wallet || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                    amount: BigInt(Math.floor(parseFloat(tx.amount) * 1e18)),
                    blockNumber: BigInt(tx.block_number),
                    transactionHash: tx.tx_hash as `0x${string}`,
                };
            });

            setEvents(parsed.reverse());
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * Income/Earnings Hooks (from earnings_history table)
 */
export function useIncomeEvents(userId: bigint | undefined) {
    const [events, setEvents] = useState<IncomeEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/${userId}/history/income`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const parsed: IncomeEvent[] = data.earnings.map((earning: any) => ({
                userId: BigInt(earning.user_id),
                amount: BigInt(Math.floor(parseFloat(earning.amount) * 1e18)),
                incomeType: earning.earning_type.toUpperCase(),
                fromUserId: earning.from_user_id ? BigInt(earning.from_user_id) : undefined,
                fromUsernameId: earning.from_username_id ? BigInt(earning.from_username_id) : undefined,
                level: earning.level || 0,
                nftId: earning.nft_id ? BigInt(earning.nft_id) : undefined,
                weekNumber: earning.week_number || undefined,
                blockNumber: BigInt(earning.block_number),
                transactionHash: earning.tx_hash as `0x${string}`,
            }));
            setEvents(parsed.reverse());
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    return { events, isLoading, error, refetch: fetchEvents };
}

export function useRankEmiClaimedEvents(userId: bigint | undefined) {
    const { events, isLoading, error, refetch } = useIncomeEvents(userId);
    const emiEvents: RankEmiClaimedEvent[] = events.filter(e => e.incomeType === 'RANK_EMI').map(e => ({
        userId: e.userId, rank: 0, emiNumber: 0, amount: e.amount, blockNumber: e.blockNumber, transactionHash: e.transactionHash,
    }));
    return { events: emiEvents, isLoading, error, refetch };
}

export function useFastBonusClaimedEvents(userId: bigint | undefined) {
    const { events, isLoading, error, refetch } = useIncomeEvents(userId);
    const fastEvents: FastBonusClaimedEvent[] = events.filter(e => e.incomeType === 'FAST_BONUS').map(e => ({
        userId: e.userId, rank: 0, amount: e.amount, blockNumber: e.blockNumber, transactionHash: e.transactionHash,
    }));
    return { events: fastEvents, isLoading, error, refetch };
}

export function useTripRewardEvents(userId: bigint | undefined) {
    const { events, isLoading, error, refetch } = useIncomeEvents(userId);
    const tripEvents: TripRewardEvent[] = events.filter(e => e.incomeType === 'TRIP_REWARD').map(e => ({
        userId: e.userId, amount: e.amount, blockNumber: e.blockNumber, transactionHash: e.transactionHash,
    }));
    return { events: tripEvents, isLoading, error, refetch };
}

export function useLuckyDrawWinnerEvents(userId: bigint | undefined) {
    const { events, isLoading, error, refetch } = useIncomeEvents(userId);
    const luckyEvents: LuckyDrawWinnerEvent[] = events.filter(e => e.incomeType === 'LUCKY_DRAW').map(e => ({
        userId: e.userId, week: e.weekNumber || 0, prize: e.amount, blockNumber: e.blockNumber, transactionHash: e.transactionHash,
    }));
    return { events: luckyEvents, isLoading, error, refetch };
}

export function useWeeklyPoolPaidEvents(userId: bigint | undefined) {
    const { events, isLoading, error, refetch } = useIncomeEvents(userId);
    const weeklyEvents: WeeklyPoolPaidEvent[] = events.filter(e => e.incomeType === 'WEEKLY_POOL').map(e => ({
        userId: e.userId, week: e.weekNumber || 0, shares: BigInt(0), amount: e.amount, blockNumber: e.blockNumber, transactionHash: e.transactionHash,
    }));
    return { events: weeklyEvents, isLoading, error, refetch };
}
