'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUserId } from '@/hooks/useContracts';
import { useLookupUser } from '@/contexts/LookupContext';
import { useUserNFTs, type NFT } from '@/hooks/useAdminAPI';
import { API_BASE_URL } from '@/config/env';

// Helper to format USD
const formatUSD = (value: string | number) => `$${Number(value).toFixed(2)}`;
const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Mobile Card Component (MySQL-based)
function NFTMobileCard({ nft, userId }: { nft: NFT & { calculatedStatus?: 'listed' | 'in_queue' | 'admin_held' }; userId: bigint }) {
    const status = nft.calculatedStatus || (nft.admin_override ? 'admin_held' : nft.cached_is_listed ? 'listed' : 'in_queue');
    const isAdminHeld = status === 'admin_held';
    const isListed = status === 'listed';
    const isExempt = Boolean(nft.queue_exempt);

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="font-mono text-lg text-[#EC4899] font-bold">#{nft.nft_id}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    {isAdminHeld ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50">
                            🔒 Admin Hold
                        </span>
                    ) : isListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50">
                            📦 In Queue
                        </span>
                    )}
                    {isExempt && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50">
                            ⭐ Exempt
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Current Value</p>
                    <p className="text-sm font-bold text-[#10B981]">{formatUSD(nft.cached_current_price)}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Base Price</p>
                    <p className="text-sm text-[#94A3B8]">{formatUSD(nft.cached_base_price)}</p>
                </div>
            </div>

            {/* Purchase Details */}
            <div className="mt-3 pt-3 border-t border-[#334155] space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748B]">Last Trade</span>
                    <span className="text-[10px] text-[#94A3B8]">{formatDateTime(nft.cached_last_traded_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748B]">Transaction</span>
                    <NFTTransactionLink nftId={nft.nft_id} userId={userId} />
                </div>
                {nft.admin_notes && (
                    <div className="mt-2 pt-2 border-t border-[#334155]">
                        <p className="text-[9px] text-[#64748B]">Admin Note:</p>
                        <p className="text-[10px] text-[#F59E0B] mt-1">{nft.admin_notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Transaction Link Component - Fetches transaction hash from events
function NFTTransactionLink({ nftId, userId }: { nftId: number; userId: bigint }) {
    const { useNFTBuyEvents, useNFTSplitEvents } = require('@/hooks/useEvents');
    const { events: buyEvents } = useNFTBuyEvents(userId);
    const { events: splitEvents } = useNFTSplitEvents(userId);

    // First check buy events
    const nftPurchaseEvent = buyEvents?.find((event: any) => event.nftId === BigInt(nftId));

    if (nftPurchaseEvent) {
        const txHash = nftPurchaseEvent.transactionHash;
        const explorerUrl = `https://opbnbscan.com/tx/${txHash}`;
        return (
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] underline flex items-center gap-1"
            >
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
                <span className="text-[10px]">↗</span>
            </a>
        );
    }

    // Check split events - NFT might be from a split
    const splitEvent = splitEvents?.find((event: any) =>
        event.newNftIds?.some((id: bigint) => id === BigInt(nftId))
    );

    if (splitEvent) {
        const txHash = splitEvent.transactionHash;
        const explorerUrl = `https://opbnbscan.com/tx/${txHash}`;
        return (
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] underline flex items-center gap-1"
            >
                {txHash.slice(0, 6)}...{txHash.slice(-4)} 🔀
                <span className="text-[10px]">↗</span>
            </a>
        );
    }

    return <span className="text-xs text-[#64748B]">-</span>;
}

// Desktop Table Row Component (MySQL-based)
function NFTTableRow({ nft, userId }: { nft: NFT & { calculatedStatus?: 'listed' | 'in_queue' | 'admin_held' }; userId: bigint }) {
    const status = nft.calculatedStatus || (nft.admin_override ? 'admin_held' : nft.cached_is_listed ? 'listed' : 'in_queue');
    const isAdminHeld = status === 'admin_held';
    const isListed = status === 'listed';
    const isExempt = Boolean(nft.queue_exempt);

    return (
        <tr className="border-b border-[#334155] hover:bg-[#1E293B]/50 transition-colors">
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="font-mono text-sm text-[#EC4899] font-bold">#{nft.nft_id}</span>
                </div>
            </td>
            <td className="p-3">
                <div className="flex flex-col gap-1">
                    {isAdminHeld ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 w-fit">
                            🔒 Admin Hold
                        </span>
                    ) : isListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 w-fit">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50 w-fit">
                            📦 In Queue
                        </span>
                    )}
                    {isExempt && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 w-fit mt-1">
                            ⭐ Exempt
                        </span>
                    )}
                </div>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm font-bold text-[#10B981]">{formatUSD(nft.cached_current_price)}</span>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm text-[#94A3B8]">{formatUSD(nft.cached_base_price)}</span>
            </td>
            <td className="p-3">
                <span className="text-xs text-[#94A3B8]">{formatDateTime(nft.cached_last_traded_at)}</span>
            </td>
            <td className="p-3">
                <NFTTransactionLink nftId={nft.nft_id} userId={userId} />
            </td>
        </tr>
    );
}

export function MyNFTsTab() {
    const { address } = useAccount();

    // Check if in lookup mode
    const { targetUserId, isLookupMode } = useLookupUser();

    const { data: walletUserId } = useUserId(address);
    const userId = isLookupMode ? targetUserId : (walletUserId as bigint);

    // Fetch NFTs from MySQL
    const { data: nftData, loading, error } = useUserNFTs(userId ? Number(userId) : null);
    const [userQueueSlots, setUserQueueSlots] = useState(0);

    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);
    const nfts = nftData?.nfts || [];
    const nftCount = nfts.length;

    // Fetch user's queue slots from MySQL
    useEffect(() => {
        const fetchQueueSlots = async () => {
            if (!userId || Number(userId) === 0) return;
            
            try {
                const res = await fetch(`${API_BASE_URL}/users/${userId}/queue-status`);
                const data = await res.json();
                setUserQueueSlots(data.queue_slots || 0);
            } catch (err) {
                console.error('Failed to fetch queue slots:', err);
                setUserQueueSlots(0);
            }
        };

        fetchQueueSlots();
    }, [userId]);

    // Calculate NFT status based on queue_slots (newest NFTs are held)
    // Sort by NFT ID descending (newest first) for queue calculation
    const nftsWithStatus = [...nfts]
        .sort((a, b) => b.nft_id - a.nft_id)
        .map((nft, index) => {
            // Admin override takes precedence
            if (nft.admin_override) {
                return { ...nft, calculatedStatus: 'admin_held' as const };
            }
            // Queue exempt NFTs are always listed
            if (nft.queue_exempt) {
                return { ...nft, calculatedStatus: 'listed' as const };
            }
            // First N NFTs (newest) are held in queue, rest are listed
            const isInQueue = index < userQueueSlots;
            return { ...nft, calculatedStatus: isInQueue ? 'in_queue' as const : 'listed' as const };
        });

    // Calculate stats based on calculated status
    const listedCount = nftsWithStatus.filter(n => n.calculatedStatus === 'listed').length;
    const heldCount = nftsWithStatus.filter(n => n.calculatedStatus === 'in_queue').length;
    const adminHeldCount = nftsWithStatus.filter(n => n.calculatedStatus === 'admin_held').length;
    const exemptCount = nftsWithStatus.filter(n => Boolean(n.queue_exempt)).length;

    // Sort: Admin held first, then regular held, then listed
    const sortedNFTs = [...nftsWithStatus].sort((a, b) => {
        if (a.calculatedStatus === 'admin_held' && b.calculatedStatus !== 'admin_held') return -1;
        if (a.calculatedStatus !== 'admin_held' && b.calculatedStatus === 'admin_held') return 1;
        if (a.calculatedStatus === 'in_queue' && b.calculatedStatus === 'listed') return -1;
        if (a.calculatedStatus === 'listed' && b.calculatedStatus === 'in_queue') return 1;
        return b.nft_id - a.nft_id; // Newest first
    });

    if (!isRegistered) {
        return (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center animate-slide-up">
                <p className="text-5xl mb-4">🪙</p>
                <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Your NFT Portfolio</h3>
                <p className="text-[#64748B]">Connect wallet to view your owned NFTs</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                        🪙 My NFTs
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Your personal NFT portfolio</p>
                </div>
            </div>

            {/* Stats Cards */}
            {nftCount > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4">
                        <p className="text-[10px] text-[#64748B] mb-1">Total NFTs</p>
                        <p className="text-2xl font-bold text-white">{nftCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#10B981]/20 p-4">
                        <p className="text-[10px] text-[#64748B] mb-1">Listed</p>
                        <p className="text-2xl font-bold text-[#10B981]">{listedCount} 🟢</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#3B82F6]/20 p-4">
                        <p className="text-[10px] text-[#64748B] mb-1">In Queue</p>
                        <p className="text-2xl font-bold text-[#3B82F6]">{heldCount} 📦</p>
                    </div>
                    {adminHeldCount > 0 && (
                        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#EF4444]/20 p-4">
                            <p className="text-[10px] text-[#64748B] mb-1">Admin Held</p>
                            <p className="text-2xl font-bold text-[#EF4444]">{adminHeldCount} 🔒</p>
                        </div>
                    )}
                </div>
            )}

            {/* NFT Display - Cards on mobile, Table on desktop */}
            {loading ? (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center">
                    <p className="text-5xl mb-4">⏳</p>
                    <p className="text-sm text-[#64748B]">Loading your NFTs...</p>
                </div>
            ) : nftCount === 0 ? (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center">
                    <p className="text-5xl mb-4">📭</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">No NFTs Yet</h3>
                    <p className="text-sm text-[#64748B]">Buy your first NFT from the Trade tab!</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {sortedNFTs.map((nft) => (
                            <NFTMobileCard key={nft.nft_id} nft={nft} userId={userId as bigint} />
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#1E293B] border-b border-[#334155]">
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">NFT ID</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Status</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Current Value</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Base Price</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Last Trade</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedNFTs.map((nft) => (
                                    <NFTTableRow key={nft.nft_id} nft={nft} userId={userId as bigint} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Info */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#10B981]/20 to-[#1E293B] border border-[#10B981]/30 rounded-xl p-3 sm:p-4 animate-slide-up">
                <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-2xl sm:text-3xl opacity-20">💡</div>
                <p className="text-[10px] sm:text-sm text-[#10B981]">
                    <strong>💡 Pro Tip:</strong> Your NFTs appreciate <span className="text-[#EC4899] font-bold">8%</span> every time they're traded. Hold to grow your portfolio value!
                </p>
            </div>
        </div>
    );
}

