'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import {
    useUserId,
    useTotalNFTs,
    useNFT,
    useBuyNFT,
    useUSDTAllowance,
    useUserAvailableLimit
} from '@/hooks/useContracts';
import { useApproveUSDT } from '@/hooks/useAdminContracts';

interface NFTData {
    nftId: bigint;
    currentPrice: bigint;
    basePrice: bigint;
    lastPurchasePrice: bigint;
    ownerId: bigint;
    buyCount: bigint;
    isListed: boolean;
    isBurned: boolean;
    isFeatured: boolean;
    isHidden: boolean;
}

function NFTCard({ nftId, userId, onBuy }: { nftId: number; userId: bigint | undefined; onBuy: (nftId: bigint, price: bigint) => void }) {
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData) return null;

    // Parse as array - contract returns tuple
    const nftArr = nftData as any[];
    if (!nftArr || nftArr[0] === BigInt(0)) return null;

    // Destructure: [nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, displayOrder, isListed, isBurned, isFeatured, isHidden]
    const [, currentPrice, , , ownerId, buyCount, , , , isListed, isBurned, isFeatured, isHidden] = nftArr;

    // Skip if burned, hidden, or not listed
    if (isBurned || isHidden || !isListed) return null;

    // Skip if owned by current user (but only if userId and ownerId are both > 0)
    // ownerId 0 means it's available for purchase from the contract
    const isActuallyOwnNft = userId && userId > BigInt(0) && ownerId === userId;
    if (isActuallyOwnNft) return null;

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border border-[#334155] hover:border-[#EC4899]/50 card-hover group animate-slide-up">
            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold bg-[#F59E0B]/30 text-[#F59E0B] border border-[#F59E0B]/50">
                    ⭐ Hot
                </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold backdrop-blur-sm bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50">
                🟢
            </div>

            {/* NFT Image */}
            <div className="h-20 sm:h-28 md:h-36 bg-gradient-to-br from-[#EC4899]/10 via-[#0F172A] to-[#D946EF]/10 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#EC4899]/20 to-[#D946EF]/20 blur-xl" />
                </div>
                <span className="relative text-4xl sm:text-5xl md:text-6xl float-slow group-hover:scale-110 transition-transform duration-300">
                    🪙
                </span>
            </div>

            {/* NFT Info */}
            <div className="p-2 sm:p-3 md:p-4">
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div>
                        <p className="text-[8px] sm:text-[10px] md:text-xs text-[#64748B] font-mono">#{nftId}</p>
                        <p className="text-[8px] text-[#475569]">{Number(buyCount)} trades</p>
                    </div>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-[#EC4899]">{formatUSD(currentPrice)}</p>
                </div>

                <button
                    onClick={() => onBuy(BigInt(nftId), currentPrice)}
                    disabled={!userId}
                    className="w-full mt-2 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-lg text-[#0F172A] text-[10px] sm:text-xs font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                    🛒 Buy Now
                </button>
            </div>
        </div>
    );
}

export function MarketplaceTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: totalNFTs } = useTotalNFTs();
    const { data: allowance, refetch: refetchAllowance } = useUSDTAllowance(address);
    const { data: availableLimit } = useUserAvailableLimit(userId as bigint);

    const { buyNFT, data: buyHash, isPending: buyPending } = useBuyNFT();
    const { approve, hash: approveHash, isPending: approvePending } = useApproveUSDT();

    const { isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyHash });
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const [pendingNftId, setPendingNftId] = useState<bigint | null>(null);
    const [pendingPrice, setPendingPrice] = useState<bigint | null>(null);

    // After approve success, execute buy
    useEffect(() => {
        if (approveSuccess && pendingNftId) {
            buyNFT(pendingNftId);
        }
    }, [approveSuccess, pendingNftId]);

    // After buy success, reset and refetch
    useEffect(() => {
        if (buySuccess) {
            setPendingNftId(null);
            setPendingPrice(null);
            refetchAllowance();
        }
    }, [buySuccess]);

    const handleBuy = (nftId: bigint, price: bigint) => {
        setPendingNftId(nftId);
        setPendingPrice(price);

        const currentAllowance = allowance as bigint || BigInt(0);

        if (currentAllowance < price) {
            // Need approval first - convert bigint to string
            approve(formatUnits(price, 18));
        } else {
            // Already approved, buy directly
            buyNFT(nftId);
        }
    };

    const nftCount = Number(totalNFTs || 0);
    const nftIds = Array.from({ length: Math.min(nftCount, 20) }, (_, i) => i + 1);

    const formatUSD = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 animate-slide-up">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC]">🛒 NFT Marketplace</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">{nftCount} NFTs total • Daily Limit: {formatUSD(availableLimit as bigint)}</p>
                </div>
            </div>

            {/* Processing State */}
            {(buyPending || approvePending) && (
                <div className="bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-xl p-3 animate-pulse">
                    <p className="text-sm text-[#EC4899] flex items-center gap-2">
                        ⏳ {approvePending ? 'Approving USDT...' : 'Processing purchase...'}
                    </p>
                </div>
            )}

            {/* NFT Grid */}
            {nftCount === 0 ? (
                <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-[#64748B]">No NFTs available right now</p>
                    <p className="text-xs text-[#475569] mt-1">Admin needs to create NFTs first</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {nftIds.map((id) => (
                        <NFTCard
                            key={id}
                            nftId={id}
                            userId={userId as bigint}
                            onBuy={handleBuy}
                        />
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#10B981]/20 to-[#1E293B] border border-[#10B981]/30 rounded-xl p-3 sm:p-4 animate-slide-up">
                <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-2xl sm:text-3xl opacity-20">💡</div>
                <p className="text-[10px] sm:text-sm text-[#10B981]">
                    <strong>💡 Tip:</strong> Each NFT appreciates <span className="text-[#EC4899] font-bold">8%</span> on purchase.
                </p>
            </div>
        </div>
    );
}
