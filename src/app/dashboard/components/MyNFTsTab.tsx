'use client';

import React from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserNFTCount, useUserNFT, useNFT, useUserInfo } from '@/hooks/useContracts';
import { useLookupUser } from '@/contexts/LookupContext';
import { useUserUnlistedCount } from '@/hooks/useUserUnlistedCount';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';

// Helper component to display owner username
function OwnerUsername({ ownerId }: { ownerId: bigint }) {
    const { data: userInfo } = useUserInfo(ownerId);

    if (!userInfo) return <span className="text-[#64748B]">...</span>;

    // Wagmi returns struct as object with named fields
    const user = userInfo as { usernameId: bigint };

    return <span className="font-mono text-[#EC4899]">BULL{user.usernameId.toString()}</span>;
}

// New NFT struct (10 fields) - matches contract
interface NFTData {
    nftId: bigint;
    currentPrice: bigint;
    basePrice: bigint;
    lastPurchasePrice: bigint;
    ownerId: bigint;
    buyCount: bigint;
    createdAt: bigint;
    lastTradedAt: bigint;
    isListed: boolean;
    isBurned: boolean;
}

// Helper to check if NFT should be unlisted (based on latest trades)
function useUnlistedNFTIds(userId: bigint | undefined, nftCount: number, unlistedCount: number) {
    // Build calls to fetch all user's NFT IDs
    const nftIdCalls = React.useMemo(() => 
        userId ? Array.from({ length: nftCount }, (_, i) => ({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'userNFTs',
            args: [userId, BigInt(i)]
        })) : []
    , [userId, nftCount]);

    const { data: nftIdsData } = useReadContracts({
        contracts: nftIdCalls as any,
        query: { enabled: nftCount > 0 && !!userId }
    });

    // Memoize nftIds array to prevent infinite loop
    const nftIds = React.useMemo(() => 
        nftIdsData?.map((r: any) => r?.result ? Number(r.result) : 0).filter((id: number) => id > 0) || []
    , [nftIdsData]);

    const nftDetailCalls = React.useMemo(() => 
        nftIds.map(nftId => ({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'nfts',
            args: [BigInt(nftId)]
        }))
    , [nftIds]);

    const { data: nftDetailsData } = useReadContracts({
        contracts: nftDetailCalls as any,
        query: { enabled: nftIds.length > 0 }
    });

    // Compute unlisted NFT IDs
    const unlistedNFTIds = React.useMemo(() => {
        if (!nftDetailsData || nftIds.length === 0) return new Set<number>();

        // Parse NFT data and sort by lastTradedAt
        const nftsWithTime: { nftId: number; lastTradedAt: bigint }[] = [];
        
        nftDetailsData.forEach((result: any, idx: number) => {
            if (result?.result) {
                const nftArray = result.result as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean];
                nftsWithTime.push({
                    nftId: nftIds[idx],
                    lastTradedAt: nftArray[7] // Index 7 is lastTradedAt
                });
            }
        });

        // Sort by lastTradedAt DESC (newest first)
        nftsWithTime.sort((a, b) => Number(b.lastTradedAt - a.lastTradedAt));

        // First N are unlisted
        const unlisted = new Set(nftsWithTime.slice(0, unlistedCount).map(n => n.nftId));
        
        console.log('🔍 Unlisted NFTs Debug:', {
            userId,
            totalNFTs: nftIds.length,
            unlistedCount,
            nftsWithTime,
            unlistedNFTIds: Array.from(unlisted)
        });
        
        return unlisted;
    }, [nftDetailsData, nftIds, unlistedCount, userId]);

    return unlistedNFTIds;
}

// Mobile Card Component
function NFTMobileCard({ nftIndex, userId, unlistedNFTIds }: { nftIndex: number; userId: bigint; unlistedNFTIds: Set<number> }) {
    // First get the NFT ID from userNFTs array
    const { data: nftIdData } = useUserNFT(userId, nftIndex);
    const nftId = nftIdData ? Number(nftIdData) : 0;

    // Then fetch the NFT data
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData || nftId === 0) return null;

    // New 10-field struct
    const nftArray = nftData as unknown as readonly [
        bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean
    ];

    const nft: NFTData = {
        nftId: nftArray[0],
        currentPrice: nftArray[1],
        basePrice: nftArray[2],
        lastPurchasePrice: nftArray[3],
        ownerId: nftArray[4],
        buyCount: nftArray[5],
        createdAt: nftArray[6],
        lastTradedAt: nftArray[7],
        isListed: nftArray[8],
        isBurned: nftArray[9],
    };

    // Don't show burned NFTs in user's collection
    if (nft.isBurned) return null;

    // SQL override: check if this NFT ID is in unlisted set (latest trades)
    const isActuallyListed = unlistedNFTIds.has(nftId) ? false : nft.isListed;

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;
    const formatDateTime = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="font-mono text-lg text-[#EC4899] font-bold">#{nftId}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    {isActuallyListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50">
                            📦 Queue
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Current Value</p>
                    <p className="text-sm font-bold text-[#10B981]">{formatUSD(nft.currentPrice)}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Purchase Price</p>
                    <p className="text-sm text-[#94A3B8]">{formatUSD(nft.lastPurchasePrice)}</p>
                </div>
            </div>

            {/* Purchase Details */}
            <div className="mt-3 pt-3 border-t border-[#334155] space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748B]">Purchase Date</span>
                    <span className="text-[10px] text-[#94A3B8]">{formatDateTime(nft.lastTradedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748B]">Transaction</span>
                    <NFTTransactionLink nftId={nftId} userId={userId} />
                </div>
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

// Desktop Table Row Component
function NFTTableRow({ nftIndex, userId, unlistedNFTIds }: { nftIndex: number; userId: bigint; unlistedNFTIds: Set<number> }) {
    // First get the NFT ID from userNFTs array
    const { data: nftIdData } = useUserNFT(userId, nftIndex);
    const nftId = nftIdData ? Number(nftIdData) : 0;

    // Then fetch the NFT data
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData || nftId === 0) return null;

    // Parse array format from Solidity struct (10 fields)
    const nftArray = nftData as unknown as readonly [
        bigint, // nftId [0]
        bigint, // currentPrice [1]
        bigint, // basePrice [2]
        bigint, // lastPurchasePrice [3]
        bigint, // ownerId [4]
        bigint, // buyCount [5]
        bigint, // createdAt [6]
        bigint, // lastTradedAt [7]
        boolean, // isListed [8]
        boolean  // isBurned [9]
    ];

    const nft: NFTData = {
        nftId: nftArray[0],
        currentPrice: nftArray[1],
        basePrice: nftArray[2],
        lastPurchasePrice: nftArray[3],
        ownerId: nftArray[4],
        buyCount: nftArray[5],
        createdAt: nftArray[6],
        lastTradedAt: nftArray[7],
        isListed: nftArray[8],
        isBurned: nftArray[9],
    };

    // Don't show burned NFTs in user's collection
    if (nft.isBurned) return null;

    // SQL override: check if this NFT ID is in unlisted set (latest trades)
    const isActuallyListed = unlistedNFTIds.has(nftId) ? false : nft.isListed;
    
    console.log(`🔍 NFT #${nftId} Desktop Row:`, {
        nftId,
        inUnlistedSet: unlistedNFTIds.has(nftId),
        contractIsListed: nft.isListed,
        finalIsListed: isActuallyListed,
        unlistedSetSize: unlistedNFTIds.size,
        lastTradedAt: nft.lastTradedAt.toString()
    });

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;
    const formatDateTime = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <tr className="border-b border-[#334155] hover:bg-[#1E293B]/50 transition-colors">
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="font-mono text-sm text-[#EC4899] font-bold">#{nftId}</span>
                </div>
            </td>
            <td className="p-3">
                <div className="flex flex-col gap-1">
                    {isActuallyListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 w-fit">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50 w-fit">
                            📦 Queue
                        </span>
                    )}
                </div>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm font-bold text-[#10B981]">{formatUSD(nft.currentPrice)}</span>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm text-[#94A3B8]">{formatUSD(nft.lastPurchasePrice)}</span>
            </td>
            <td className="p-3">
                <span className="text-xs text-[#94A3B8]">{formatDateTime(nft.lastTradedAt)}</span>
            </td>
            <td className="p-3">
                <NFTTransactionLink nftId={nftId} userId={userId} />
            </td>
        </tr>
    );
}

// Helper to get NFT status for sorting
function useNFTStatus(userId: bigint, nftIndex: number) {
    const { data: nftIdData } = useUserNFT(userId, nftIndex);
    const nftId = nftIdData ? Number(nftIdData) : 0;
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData || nftId === 0) return { nftId: 0, isListed: false, index: nftIndex };

    const nftArray = nftData as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean, boolean, boolean];
    return { nftId, isListed: nftArray[9], index: nftIndex };
}

export function MyNFTsTab() {
    const { address } = useAccount();

    // Check if in lookup mode
    const { targetUserId, isLookupMode } = useLookupUser();

    const { data: walletUserId } = useUserId(address);
    const userId = isLookupMode ? targetUserId : (walletUserId as bigint);
    const { data: userNFTCount } = useUserNFTCount(userId as bigint);
    const { unlistedCount } = useUserUnlistedCount(userId || undefined);

    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    const nftCount = Number(userNFTCount || 0);

    // Get unlisted NFT IDs based on latest trades
    const unlistedNFTIds = useUnlistedNFTIds(userId || undefined, nftCount, unlistedCount);

    // Show all NFTs
    const allIndices = Array.from({ length: nftCount }, (_, i) => i);
    const sortedIndices = [...allIndices].sort((a, b) => b - a);

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

            {/* NFT Display - Cards on mobile, Table on desktop */}
            {nftCount === 0 ? (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center">
                    <p className="text-5xl mb-4">📭</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">No NFTs Yet</h3>
                    <p className="text-sm text-[#64748B]">Buy your first NFT from the Trade tab!</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {sortedIndices.map((index) => (
                            <NFTMobileCard key={index} nftIndex={index} userId={userId as bigint} unlistedNFTIds={unlistedNFTIds} />
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
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Purchase Price</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Purchase Date</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedIndices.map((index) => (
                                    <NFTTableRow key={index} nftIndex={index} userId={userId as bigint} unlistedNFTIds={unlistedNFTIds} />
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

