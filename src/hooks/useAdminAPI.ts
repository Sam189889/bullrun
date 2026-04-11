import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';

// ============================================================================
// TYPES
// ============================================================================

export interface NFT {
    nft_id: number;
    owner_id: number;
    cached_current_price: string;
    cached_base_price: string;
    cached_is_listed: boolean;
    cached_created_at: number;
    cached_last_traded_at: number;
    cached_buy_count: number;
    is_hidden: boolean;
    is_pinned: boolean;
    pin_order: number;
    admin_override: boolean;
    queue_exempt: boolean;
    admin_notes: string | null;
    hide_reason: string | null;
    hidden_by: string | null;
    hidden_at: string | null;
    last_synced_at: string;
    created_at: string;
    updated_at: string;
}

export interface NFTStats {
    total: number;
    active: number;
    burned: number;
    hidden: number;
    pinned: number;
    listed: number;
    avg_price: string;
    total_trades: number;
}

export interface QueueRule {
    rule_id: number;
    rule_name: string;
    enabled: boolean;
    priority: number;
    rule_type: 'package_based' | 'direct_based' | 'earnings_based' | 'custom' | 'disabled';
    config: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface QueueStats {
    total_rules: number;
    enabled_rules: number;
    disabled_rules: number;
    total_users: number;
    avg_nfts_per_user: number;
    avg_earnings: number;
}

// ============================================================
// NFT HOOKS
// ============================================================

/**
 * Fetch all NFTs with filters
 */
export function useAdminNFTs(filters: {
    include_hidden?: boolean;
    only_pinned?: boolean;
    only_hidden?: boolean;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
} = {}) {
    const [data, setData] = useState<{ nfts: NFT[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNFTs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });

            const res = await fetch(`${API_BASE_URL}/nfts?${params}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err as Error);
            console.error('[useAdminNFTs] Error:', err);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchNFTs();
    }, [fetchNFTs]);

    return { data, loading, error, refetch: fetchNFTs };
}

/**
 * Get NFT statistics
 */
export function useNFTStats() {
    const [stats, setStats] = useState<NFTStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/nfts/stats`);
            const json = await res.json();
            setStats(json);
        } catch (err) {
            console.error('[useNFTStats] Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refetch: fetchStats };
}

/**
 * Get single NFT details
 */
export function useNFTDetails(nftId: number | null) {
    const [nft, setNFT] = useState<NFT | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!nftId) return;

        setLoading(true);
        fetch(`${API_BASE_URL}/nfts/${nftId}`)
            .then(res => res.json())
            .then(setNFT)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [nftId]);

    return { nft, loading };
}

/**
 * Hide/show NFT
 */
export async function hideNFT(
    nftId: number,
    isHidden: boolean,
    hideReason?: string,
    adminWallet?: string
) {
    const res = await fetch(`${API_BASE_URL}/nfts/${nftId}/hide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            is_hidden: isHidden,
            hide_reason: hideReason,
            admin_wallet: adminWallet
        })
    });
    return res.json();
}

/**
 * Pin/unpin NFT
 */
export async function pinNFT(nftId: number, isPinned: boolean, pinOrder?: number) {
    const res = await fetch(`${API_BASE_URL}/nfts/${nftId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            is_pinned: isPinned,
            pin_order: pinOrder
        })
    });
    return res.json();
}

/**
 * Reorder pinned NFTs
 */
export async function reorderPinnedNFTs(pinnedNfts: { nft_id: number; pin_order: number }[]) {
    const res = await fetch(`${API_BASE_URL}/nfts/bulk-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned_nfts: pinnedNfts })
    });
    return res.json();
}

/**
 * Set queue override for NFT
 */
export async function setNFTQueueOverride(
    nftId: number,
    adminOverride: boolean,
    queueExempt: boolean
) {
    const res = await fetch(`${API_BASE_URL}/nfts/${nftId}/queue-override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            admin_override: adminOverride,
            queue_exempt: queueExempt
        })
    });
    return res.json();
}

/**
 * Update admin notes
 */
export async function updateNFTNotes(nftId: number, adminNotes: string) {
    const res = await fetch(`${API_BASE_URL}/nfts/${nftId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes })
    });
    return res.json();
}

// ============================================================
// QUEUE RULES HOOKS
// ============================================================

/**
 * Get all queue rules
 */
export function useQueueRules() {
    const [rules, setRules] = useState<QueueRule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/queue/rules`);
            const json = await res.json();
            setRules(json);
        } catch (err) {
            console.error('[useQueueRules] Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    return { rules, loading, refetch: fetchRules };
}

/**
 * Get queue statistics
 */
export function useQueueStats() {
    const [stats, setStats] = useState<QueueStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/queue/stats`);
            const json = await res.json();
            setStats(json);
        } catch (err) {
            console.error('[useQueueStats] Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refetch: fetchStats };
}

/**
 * Create queue rule
 */
export async function createQueueRule(ruleData: {
    rule_name: string;
    rule_type: QueueRule['rule_type'];
    enabled?: boolean;
    priority: number;
    config: Record<string, any>;
}) {
    const res = await fetch(`${API_BASE_URL}/queue/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
    });
    return res.json();
}

/**
 * Update queue rule
 */
export async function updateQueueRule(ruleId: number, ruleData: Partial<QueueRule>) {
    const res = await fetch(`${API_BASE_URL}/queue/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
    });
    return res.json();
}

/**
 * Delete queue rule
 */
export async function deleteQueueRule(ruleId: number) {
    const res = await fetch(`${API_BASE_URL}/queue/rules/${ruleId}`, {
        method: 'DELETE'
    });
    return res.json();
}

/**
 * Toggle queue rule enabled/disabled
 */
export async function toggleQueueRule(ruleId: number, enabled: boolean) {
    const res = await fetch(`${API_BASE_URL}/queue/rules/${ruleId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
    });
    return res.json();
}

/**
 * Reorder queue rules
 */
export async function reorderQueueRules(rules: { rule_id: number; priority: number }[]) {
    const res = await fetch(`${API_BASE_URL}/queue/rules/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
    });
    return res.json();
}

/**
 * Get users affected by a rule
 */
export async function getAffectedUsers(ruleId: number) {
    const res = await fetch(`${API_BASE_URL}/queue/affected-users/${ruleId}`);
    return res.json();
}

// ============================================================================
// USER NFT HOOKS
// ============================================================================

/**
 * Hook to fetch user's NFTs from MySQL
 * Returns NFTs with queue status (held vs listed)
 */
export function useUserNFTs(userId: number | bigint | null) {
    const [data, setData] = useState<{ nfts: NFT[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNFTs = useCallback(async () => {
        if (!userId || Number(userId) === 0) {
            setData({ nfts: [], total: 0 });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userIdStr = typeof userId === 'bigint' ? userId.toString() : userId.toString();
            const res = await fetch(`${API_BASE_URL.replace('/admin', '/user')}/nfts/${userIdStr}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            console.error('[useUserNFTs] Error:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchNFTs();
    }, [fetchNFTs]);

    return { data, loading, error, refetch: fetchNFTs };
}

/**
 * Hook to fetch marketplace NFTs (excludes queued NFTs)
 */
export function useMarketplaceNFTs(limit = 100) {
    const [data, setData] = useState<{ nfts: NFT[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNFTs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL.replace('/admin', '/marketplace')}/nfts?limit=${limit}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            console.error('[useMarketplaceNFTs] Error:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchNFTs();
    }, [fetchNFTs]);

    return { data, loading, error, refetch: fetchNFTs };
}
