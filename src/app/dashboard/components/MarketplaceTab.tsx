'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import {
    useUserId,
    useTotalNFTs,
    useNFT,
    useBuyNFT,
    useUSDTAllowance,
    useUserAvailableLimit,
    useUSDTBalance
} from '@/hooks/useContracts';
import { useApproveUSDT, useDayStartTimestamp, useDayLength, useCurrentDay } from '@/hooks/useAdminContracts';

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

    // Hide own NFTs from marketplace
    const isOwnNFT = !!(userId && userId > BigInt(0) && ownerId === userId);
    if (isOwnNFT) return null;

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
                <div className="flex justify-center items-center mb-1 sm:mb-2">
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
    const { data: availableLimit, refetch: refetchLimit } = useUserAvailableLimit(userId as bigint);
    
    // Fetch day settings for debugging
    const { data: dayStart } = useDayStartTimestamp();
    const { data: dayLength } = useDayLength();
    const { data: currentDay } = useCurrentDay();
    
    // Debug logging with timestamp
    useEffect(() => {
        if (availableLimit !== undefined && availableLimit !== null) {
            const now = new Date().toLocaleTimeString();
            console.log(`📊 [${now}] Available Limit:`, {
                userId: userId?.toString(),
                availableLimit: availableLimit.toString(),
                formatted: `$${Number(formatUnits(availableLimit as bigint, 18)).toFixed(2)}`
            });
        }
    }, [availableLimit, userId]);
    
    // Debug day settings
    useEffect(() => {
        console.log('🕐 Day Settings:', {
            dayStart: dayStart?.toString() || 'Not set',
            dayLength: dayLength?.toString() || 'Not set',
            currentDay: currentDay?.toString() || 'Not set',
            dayStartDate: dayStart ? new Date(Number(dayStart) * 1000).toLocaleString() : 'N/A'
        });
    }, [dayStart, dayLength, currentDay]);
    
    // Fetch balances
    const { data: nativeBalance } = useBalance({ address });
    const { data: usdtBalance } = useUSDTBalance(address);

    const { buyNFT, data: buyHash, isPending: buyPending } = useBuyNFT();
    const { approve, hash: approveHash, isPending: approvePending } = useApproveUSDT();

    const { isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyHash });
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const [pendingNftId, setPendingNftId] = useState<bigint | null>(null);
    const [pendingPrice, setPendingPrice] = useState<bigint | null>(null);
    const [error, setError] = useState<string>('');
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

    // After approve success, execute buy automatically
    useEffect(() => {
        if (approveSuccess && pendingNftId && isWaitingForApproval) {
            console.log('✅ Approval confirmed! Executing buy...');
            setIsWaitingForApproval(false);
            // Small delay to ensure blockchain state is updated
            setTimeout(() => {
                buyNFT(pendingNftId);
            }, 500);
        }
    }, [approveSuccess, pendingNftId, isWaitingForApproval]);

    // After buy success, reset and refetch
    useEffect(() => {
        if (buySuccess) {
            console.log('✅ Purchase successful!');
            setPendingNftId(null);
            setPendingPrice(null);
            setError('');
            refetchAllowance();
            refetchLimit(); // Refetch daily limit after purchase
        }
    }, [buySuccess, refetchAllowance, refetchLimit]);

    const handleBuy = (nftId: bigint, price: bigint) => {
        setError('');
        
        // Validate USDT balance
        const currentUsdtBalance = usdtBalance as bigint || BigInt(0);
        if (currentUsdtBalance < price) {
            setError(`Insufficient USDT balance! You need $${Number(formatUnits(price, 18)).toFixed(2)} but have $${Number(formatUnits(currentUsdtBalance, 18)).toFixed(2)}`);
            return;
        }

        // Validate native balance for gas
        const minGasBalance = BigInt('100000000000000'); // 0.01 BNB
        if (!nativeBalance || nativeBalance.value < minGasBalance) {
            setError('Insufficient BNB for gas fees! You need at least 0.0001 BNB');
            return;
        }

        setPendingNftId(nftId);
        setPendingPrice(price);

        const currentAllowance = allowance as bigint || BigInt(0);

        if (currentAllowance < price) {
            // Need approval first - approve exact price
            console.log(`🔐 Requesting approval for $${Number(formatUnits(price, 18)).toFixed(2)}...`);
            setIsWaitingForApproval(true);
            approve(formatUnits(price, 18));
        } else {
            // Already approved, buy directly
            console.log('✅ Already approved, buying directly...');
            buyNFT(nftId);
        }
    };

    const nftCount = Number(totalNFTs || 0);
    const allNftIds = Array.from({ length: nftCount }, (_, i) => i + 1);
    
    // Shuffle NFTs every 5 seconds
    const [shuffledIds, setShuffledIds] = useState<number[]>([]);
    
    useEffect(() => {
        // Fisher-Yates shuffle algorithm
        const shuffleArray = (array: number[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };
        
        // Initial shuffle
        setShuffledIds(shuffleArray(allNftIds));
        
        // Shuffle every 5 seconds
        const interval = setInterval(() => {
            setShuffledIds(shuffleArray(allNftIds));
        }, 5000);
        
        return () => clearInterval(interval);
    }, [nftCount]);
    
    // Show first 20 NFTs
    const nftIds = shuffledIds.slice(0, 20);

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
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Browse and purchase NFTs • {nftCount} available</p>
                </div>
            </div>

            {/* Balance Display - Compact */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-lg p-2 sm:p-3">
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">💰 USDT</p>
                    <p className="text-sm sm:text-base font-bold text-[#10B981]">
                        ${Number(formatUnits(usdtBalance as bigint || BigInt(0), 18)).toFixed(2)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-lg p-2 sm:p-3">
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">⛽ BNB</p>
                    <p className="text-sm sm:text-base font-bold text-[#3B82F6]">
                        {nativeBalance ? Number(formatUnits(nativeBalance.value, 18)).toFixed(4) : '0.0000'}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-lg p-2 sm:p-3">
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">📊 Daily Limit</p>
                    <p className="text-sm sm:text-base font-bold text-[#EC4899]">
                        {formatUSD(availableLimit as bigint)}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 sm:p-4 animate-slide-up">
                    <p className="text-xs sm:text-sm text-[#EF4444] flex items-center gap-2">
                        ⚠️ {error}
                    </p>
                </div>
            )}

            {/* Processing State */}
            {(buyPending || approvePending || isWaitingForApproval) && (
                <div className="bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-xl p-3 sm:p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                            <p className="text-sm sm:text-base font-bold text-[#EC4899] mb-1">
                                {approvePending ? '🔐 Approving USDT...' : 
                                 isWaitingForApproval ? '⏳ Waiting for approval confirmation...' :
                                 '🛒 Processing purchase...'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-[#94A3B8]">
                                {approvePending ? 'Please confirm the approval transaction in your wallet' :
                                 isWaitingForApproval ? 'Approval confirmed! Purchase will start automatically...' :
                                 'Please wait while your NFT purchase is being processed'}
                            </p>
                        </div>
                    </div>
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
