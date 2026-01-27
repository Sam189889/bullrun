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

interface SelectedNFT {
    nftId: number;
    currentPrice: bigint;
    buyCount: number;
}

// Reset Timer Component - Shows countdown to next daily limit reset
function ResetTimer({ dayStart, dayLengthSeconds }: { dayStart: bigint | undefined; dayLengthSeconds: bigint | undefined }) {
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

    useEffect(() => {
        if (!dayStart || !dayLengthSeconds) {
            setTimeLeft('--:--:--');
            return;
        }

        const calcTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const start = Number(dayStart);
            const length = Number(dayLengthSeconds);

            // Calculate current day number
            const elapsed = now - start;
            const currentDayNum = Math.floor(elapsed / length);

            // Next reset timestamp
            const nextReset = start + ((currentDayNum + 1) * length);
            const secondsLeft = nextReset - now;

            if (secondsLeft <= 0) {
                return '00:00:00';
            }

            const hours = Math.floor(secondsLeft / 3600);
            const minutes = Math.floor((secondsLeft % 3600) / 60);
            const seconds = secondsLeft % 60;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calcTimeLeft());
        const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);

        return () => clearInterval(interval);
    }, [dayStart, dayLengthSeconds]);

    return (
        <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#EF4444]/10 border border-[#F59E0B]/30 rounded-lg p-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <span className="text-xs text-[#64748B]">Daily Limit Resets In</span>
                </div>
                <span className="text-lg font-bold text-[#F59E0B] font-mono">{timeLeft}</span>
            </div>
        </div>
    );
}

function NFTCard({ nftId, userId, onSelect }: { nftId: number; userId: bigint | undefined; onSelect: (nft: SelectedNFT) => void }) {
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
    const priceNum = Number(formatUnits(currentPrice, 18));
    const buyCountNum = Number(buyCount);

    // Hot NFT if traded more than 5 times or near $200
    const isHot = priceNum >= 150 || buyCountNum >= 5;

    // Select bull image (1-11) based on NFT ID, cycling
    const bullImageNum = ((nftId - 1) % 11) + 1;
    const bullImage = `/bulls/bull${bullImageNum}.png`;

    return (
        <div className={`
            relative overflow-hidden rounded-xl border-2 border-[#334155]
            bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] 
            hover:border-[#EC4899] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]
            transition-all duration-300 group animate-slide-up
        `}>
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899]/0 via-[#EC4899]/10 to-[#EC4899]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* NFT Visual - Bull Image */}
            <div className="h-28 bg-gradient-to-br from-[#EC4899]/10 via-[#0F172A] to-[#EF4444]/10 flex items-center justify-center relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#EC4899]/20 to-[#EF4444]/20 blur-2xl animate-pulse" />
                </div>

                {/* Bull Image - Zoomed */}
                <img
                    src={bullImage}
                    alt={`Bull NFT #${nftId}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                />
            </div>

            {/* Price & Action Section */}
            <div className="p-2 sm:p-3 bg-gradient-to-t from-[#0F172A] to-transparent">
                {/* Price display */}
                <div className="text-center mb-2">
                    <p className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#F59E0B]">
                        {formatUSD(currentPrice)}
                    </p>
                </div>

                <button
                    onClick={() => onSelect({ nftId, currentPrice, buyCount: buyCountNum })}
                    disabled={!userId}
                    className={`
                        w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wide
                        bg-gradient-to-r from-[#EC4899] via-[#D946EF] to-[#EC4899] background-animate
                        text-white shadow-[0_4px_15px_rgba(236,72,153,0.4)]
                        hover:shadow-[0_6px_20px_rgba(236,72,153,0.6)] hover:scale-[1.02]
                        active:scale-95 transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    👁️ View Details
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
    const [selectedNFT, setSelectedNFT] = useState<SelectedNFT | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            setIsModalOpen(false); // Close modal on success
            setSelectedNFT(null);
            refetchAllowance();
            refetchLimit(); // Refetch daily limit after purchase
        }
    }, [buySuccess, refetchAllowance, refetchLimit]);

    const handleSelectNFT = (nft: SelectedNFT) => {
        setSelectedNFT(nft);
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNFT(null);
        setError('');
    };

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

    // Show first 12 NFTs
    const nftIds = shuffledIds.slice(0, 12);

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

            {/* Reset Timer */}
            <ResetTimer dayStart={dayStart as bigint} dayLengthSeconds={dayLength as bigint} />

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {nftIds.map((id) => (
                        <NFTCard
                            key={id}
                            nftId={id}
                            userId={userId as bigint}
                            onSelect={handleSelectNFT}
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

            {/* NFT Details Modal */}
            {isModalOpen && selectedNFT && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto" 
                    onClick={handleCloseModal}
                >
                    <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#EC4899] rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(236,72,153,0.5)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-[#64748B] hover:text-[#F8FAFC] text-2xl transition-colors z-10"
                        >
                            ✕
                        </button>

                        {/* NFT Image */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899]/30 to-[#EF4444]/30 blur-3xl" />
                                <img
                                    src={`/bulls/bull${((selectedNFT.nftId - 1) % 11) + 1}.png`}
                                    alt={`Bull NFT #${selectedNFT.nftId}`}
                                    className="relative w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                                />
                            </div>
                        </div>

                        {/* Price Only */}
                        <div className="text-center mb-6">
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#F59E0B]">
                                ${Number(formatUnits(selectedNFT.currentPrice, 18)).toFixed(2)}
                            </p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                                <p className="text-xs text-[#EF4444] flex items-center gap-2">
                                    ⚠️ {error}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3 rounded-lg font-bold text-sm bg-[#334155] text-[#F8FAFC] hover:bg-[#475569] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleBuy(BigInt(selectedNFT.nftId), selectedNFT.currentPrice);
                                }}
                                disabled={buyPending || approvePending || isWaitingForApproval}
                                className="flex-1 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {buyPending || approvePending || isWaitingForApproval ? '⏳ Processing...' : '⚡ Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
