'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import {
    useUserId,
    useNFT,
    useBuyNFT,
    useUSDTAllowance,
    useUserAvailableLimit,
    useUserDailyLimitData,
    useUSDTBalance,
    useUserWeeklyTradingVolume,
    useCurrentWeek
} from '@/hooks/useContracts';
import { useMarketplaceNFTs, type NFT } from '@/hooks/useAdminAPI';
import { useApproveUSDT, useDayStartTimestamp, useDayLength, useCurrentDay } from '@/hooks/useAdminContracts';
import { useNFTControls } from '@/hooks/useNFTControls';
import { useLookupUser } from '@/contexts/LookupContext';



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

// Trading Milestone Tracker - Shows weekly progress toward share rewards
function TradingMilestoneTracker({ userId, weekNumber }: { userId: bigint | undefined; weekNumber: number }) {
    const { data: weeklyVolume } = useUserWeeklyTradingVolume(userId, weekNumber);
    
    // Trading milestone settings: $1000 = 2 shares
    const MILESTONE_THRESHOLD = 1000; // $1000 per milestone
    const SHARES_PER_MILESTONE = 2;
    
    const volume = weeklyVolume ? Number(formatUnits(weeklyVolume as bigint, 18)) : 0;
    const milestones = Math.floor(volume / MILESTONE_THRESHOLD);
    const progressToNext = volume % MILESTONE_THRESHOLD;
    const progressPercent = (progressToNext / MILESTONE_THRESHOLD) * 100;
    
    return (
        <div className="bg-gradient-to-r from-[#EC4899]/10 to-[#3B82F6]/10 border border-[#EC4899]/30 rounded-lg p-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span className="text-xs text-[#64748B]">Weekly Trading Milestones</span>
                </div>
                <span className="text-sm font-bold text-[#EC4899]">{milestones} × {SHARES_PER_MILESTONE} = {milestones * SHARES_PER_MILESTONE} shares</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
                <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#EC4899] to-[#3B82F6] transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">
                    ${progressToNext.toFixed(2)} / ${MILESTONE_THRESHOLD}
                </span>
                <span className="text-[#10B981]">
                    ${(MILESTONE_THRESHOLD - progressToNext).toFixed(2)} to next milestone
                </span>
            </div>
            
            {volume === 0 && (
                <p className="text-xs text-[#64748B] mt-2 text-center">
                    💡 Trade NFTs to earn shares! Every ${MILESTONE_THRESHOLD} = {SHARES_PER_MILESTONE} shares
                </p>
            )}
        </div>
    );
}

function NFTCard({ nft, userId, onSelect, controls, isLookupMode }: { nft: NFT; userId: bigint | undefined; onSelect: (nft: SelectedNFT) => void; controls: ReturnType<typeof useNFTControls>; isLookupMode?: boolean }) {
    // Use MySQL data directly
    const nftId = nft.nft_id;
    const currentPrice = BigInt(Math.floor(Number(nft.cached_current_price) * 1e18));
    const ownerId = BigInt(nft.owner_id);
    const buyCountNum = nft.cached_buy_count;

    // Hide own NFTs from marketplace
    const isOwnNFT = !!(userId && userId > BigInt(0) && ownerId === userId);
    if (isOwnNFT) return null;

    // Define helper variables
    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    // Apply admin controls - hide hidden NFTs from marketplace (already filtered by backend)
    // if (controls.isHidden(nftId)) return null;

    // Select bull image (1-11) based on NFT ID, cycling
    const bullImageNum = ((nftId - 1) % 11) + 1;
    const bullImageExt = bullImageNum >= 10 ? 'jpg' : 'png';
    const bullImage = `/bulls/bull${bullImageNum}.${bullImageExt}`;

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
            <div className="aspect-square bg-gradient-to-br from-[#EC4899]/10 via-[#0F172A] to-[#EF4444]/10 flex items-center justify-center relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#EC4899]/20 to-[#EF4444]/20 blur-2xl animate-pulse" />
                </div>

                {/* NFT ID Badge - Only in Lookup Mode */}
                {isLookupMode && (
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-[#EC4899]/50 z-10">
                        <p className="text-xs font-bold text-[#EC4899]">#{nftId}</p>
                    </div>
                )}

                {/* Bull Image - Covers full area */}
                <img
                    src={bullImage}
                    alt={`Bull NFT #${nftId}`}
                    className="relative w-full h-full object-cover scale-125 group-hover:scale-140 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"
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
    const { isLookupMode, targetUserId } = useLookupUser();
    const { data: userId } = useUserId(address);
    const { data: marketplaceData, loading: marketplaceLoading } = useMarketplaceNFTs(100);
    const { data: allowance, refetch: refetchAllowance } = useUSDTAllowance(address);
    const { data: availableLimit, refetch: refetchLimit } = useUserAvailableLimit(userId as bigint);
    const { data: dailyLimitData, refetch: refetchDailyLimitData } = useUserDailyLimitData(userId as bigint);
    const nftControls = useNFTControls();

    // Use availableLimit from contract (handles day reset properly, same as HomeTab)
    const actualRemainingLimit = availableLimit ? (availableLimit as bigint) : BigInt(0);

    // Fetch day settings for debugging
    const { data: dayStart } = useDayStartTimestamp();
    const { data: dayLength } = useDayLength();
    const { data: currentDay } = useCurrentDay();
    
    // Fetch current week for milestone tracking
    const { data: currentWeek } = useCurrentWeek();
    const weekNumber = currentWeek ? Number(currentWeek) : 0;

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
    const { data: usdtBalance, refetch: refetchUSDTBalance } = useUSDTBalance(address);

    const { buyNFT, data: buyHash, isPending: buyPending, error: buyWriteError } = useBuyNFT();
    const { approve, hash: approveHash, isPending: approvePending } = useApproveUSDT();

    const { isSuccess: buySuccess, isError: buyError } = useWaitForTransactionReceipt({ hash: buyHash });
    const { isSuccess: approveSuccess, isError: approveError } = useWaitForTransactionReceipt({ hash: approveHash });

    const [pendingNftId, setPendingNftId] = useState<bigint | null>(null);
    const [pendingPrice, setPendingPrice] = useState<bigint | null>(null);
    const [error, setError] = useState<string>('');
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState<SelectedNFT | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // After approve success, execute buy automatically
    useEffect(() => {
        if (approveSuccess && pendingNftId && isWaitingForApproval) {
            console.log('✅ Approval confirmed! Refetching allowance...');
            setIsWaitingForApproval(false);
            // Refetch allowance to ensure it's updated
            refetchAllowance();
            toast.loading('⏳ Preparing purchase...', { id: 'buy-prep', duration: 3000 });
            // Longer delay to avoid RPC rate limiting
            setTimeout(() => {
                console.log('🚀 Executing buy...');
                buyNFT(pendingNftId);
            }, 3000); // Increased to 3 seconds for RPC rate limit
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [approveSuccess, pendingNftId, isWaitingForApproval]);

    // After buy success, reset and refetch
    useEffect(() => {
        if (buySuccess) {
            console.log('✅ Purchase successful!');
            // Dismiss any loading toasts
            toast.dismiss('buy-prep');
            // Show success toast
            toast.success('🎉 NFT Purchase Successful!', {
                duration: 4000,
                icon: '✅',
            });

            setPendingNftId(null);
            setPendingPrice(null);
            setError('');
            setIsModalOpen(false); // Close modal on success
            setSelectedNFT(null);

            // Refetch all data without reload
            refetchAllowance();
            refetchLimit();
            refetchDailyLimitData();
            refetchUSDTBalance();

            // Force refetch NFT list after delay to ensure blockchain state updated
            setTimeout(() => {
                // This will trigger re-render of NFT list
                window.dispatchEvent(new Event('nft-purchased'));
            }, 1000);
        }
    }, [buySuccess, refetchAllowance, refetchLimit, refetchDailyLimitData, refetchUSDTBalance]);

    // Handle approval errors
    useEffect(() => {
        if (approveError) {
            console.error('❌ Approval failed!');
            toast.error('❌ Approval Failed! Please try again.', {
                duration: 4000,
            });
            setIsWaitingForApproval(false);
            setPendingNftId(null);
            setPendingPrice(null);
        }
    }, [approveError]);

    // Handle buy write errors (before transaction is submitted)
    useEffect(() => {
        if (buyWriteError) {
            console.error('❌ Buy write error:', buyWriteError);
            toast.dismiss('buy-prep');
            toast.error(`❌ Purchase Failed: ${buyWriteError.message || 'Unknown error'}`, {
                duration: 6000,
            });
            setPendingNftId(null);
            setPendingPrice(null);
        }
    }, [buyWriteError]);

    // Handle buy transaction errors (after transaction is submitted but fails)
    useEffect(() => {
        if (buyError) {
            console.error('❌ Purchase transaction failed!');
            console.error('Transaction hash:', buyHash);
            console.error('NFT ID:', pendingNftId?.toString());
            console.error('Price:', pendingPrice ? formatUnits(pendingPrice, 18) : 'N/A');
            toast.dismiss('buy-prep');
            toast.error('❌ Transaction Failed! Check console for details.', {
                duration: 5000,
            });
            setPendingNftId(null);
            setPendingPrice(null);
        }
    }, [buyError, buyHash, pendingNftId, pendingPrice]);

    const handleSelectNFT = (nft: SelectedNFT) => {
        setSelectedNFT(nft);
        setIsModalOpen(true);
        setError('');
        // Pre-validate on modal open
        validateTransaction(nft.currentPrice);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedNFT(null);
        setError('');
    };

    // Validation function to check all conditions
    const validateTransaction = (price: bigint): { isValid: boolean; error: string } => {
        // Check USDT balance
        const currentUsdtBalance = usdtBalance as bigint || BigInt(0);
        if (currentUsdtBalance < price) {
            const error = `❌ Insufficient USDT! Need $${Number(formatUnits(price, 18)).toFixed(2)}, have $${Number(formatUnits(currentUsdtBalance, 18)).toFixed(2)}`;
            setError(error);
            return { isValid: false, error };
        }

        // Check BNB for gas
        const minGasBalance = BigInt('100000000000000'); // 0.0001 BNB
        if (!nativeBalance || nativeBalance.value < minGasBalance) {
            const error = '⛽ Insufficient BNB for gas! Need at least 0.0001 BNB';
            setError(error);
            return { isValid: false, error };
        }

        // Check daily trading limit (use actual remaining)
        const currentLimit = actualRemainingLimit || BigInt(0);
        if (currentLimit < price) {
            const error = `📊 Daily limit exceeded! Available: $${Number(formatUnits(currentLimit, 18)).toFixed(2)}, Need: $${Number(formatUnits(price, 18)).toFixed(2)}`;
            setError(error);
            return { isValid: false, error };
        }

        setError('');
        return { isValid: true, error: '' };
    };

    const handleBuy = (nftId: bigint, price: bigint) => {
        // Final validation before transaction
        const validation = validateTransaction(price);
        if (!validation.isValid) {
            return;
        }

        setPendingNftId(nftId);
        setPendingPrice(price);

        const currentAllowance = allowance as bigint || BigInt(0);
        
        console.log('💰 Buy Check:', {
            nftId: nftId.toString(),
            price: formatUnits(price, 18),
            currentAllowance: formatUnits(currentAllowance, 18),
            needsApproval: currentAllowance < price,
        });

        if (currentAllowance >= price) {
            // Already approved, buy directly
            console.log('✅ Already approved, buying directly...');
            buyNFT(nftId);
        } else {
            // Need approval first - approve with buffer (price + 10%)
            const approvalAmount = (price * BigInt(110)) / BigInt(100);
            console.log(`🔐 Requesting approval for $${Number(formatUnits(approvalAmount, 18)).toFixed(2)}...`);
            setIsWaitingForApproval(true);
            approve(formatUnits(approvalAmount, 18));
        }
    };

    const marketplaceNFTs = marketplaceData?.nfts || [];
    const nftCount = marketplaceNFTs.length;

    // Shuffle NFTs every 5 seconds
    const [shuffledNFTs, setShuffledNFTs] = useState<NFT[]>([]);
    const [displayCount, setDisplayCount] = useState(0);

    useEffect(() => {
        // Fisher-Yates shuffle algorithm
        const shuffleArray = (array: NFT[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        if (marketplaceNFTs.length > 0) {
            // Initial shuffle
            setShuffledNFTs(shuffleArray(marketplaceNFTs));

            // Shuffle every 5 seconds
            const interval = setInterval(() => {
                setShuffledNFTs(shuffleArray(marketplaceNFTs));
                setDisplayCount(0); // Reset display count on shuffle
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [marketplaceNFTs.length]);

    // Apply pin to top: pinned NFTs first, then shuffled
    const { pinnedNFTIds } = nftControls;
    const pinnedNFTs = shuffledNFTs.filter(nft => pinnedNFTIds.includes(nft.nft_id));
    const unpinnedNFTs = shuffledNFTs.filter(nft => !pinnedNFTIds.includes(nft.nft_id));
    
    // Show pinned NFTs first, then first 20 unpinned shuffled NFTs
    const displayNFTs = [...pinnedNFTs, ...unpinnedNFTs.slice(0, 20)];

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

            {/* Balance Display - Compact with Warnings */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {/* USDT Balance */}
                <div className={`bg-gradient-to-br from-[#1E293B] to-[#0F172A] border rounded-lg p-2 sm:p-3 ${(usdtBalance as bigint || BigInt(0)) < BigInt('10000000000000000000')
                    ? 'border-[#EF4444]/50 animate-pulse'
                    : 'border-[#334155]'
                    }`}>
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">💰 USDT</p>
                    <p className={`text-sm sm:text-base font-bold ${(usdtBalance as bigint || BigInt(0)) < BigInt('10000000000000000000')
                        ? 'text-[#EF4444]'
                        : 'text-[#10B981]'
                        }`}>
                        ${Number(formatUnits(usdtBalance as bigint || BigInt(0), 18)).toFixed(2)}
                    </p>
                    {(usdtBalance as bigint || BigInt(0)) < BigInt('10000000000000000000') && (
                        <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Low balance</p>
                    )}
                </div>

                {/* BNB Balance */}
                <div className={`bg-gradient-to-br from-[#1E293B] to-[#0F172A] border rounded-lg p-2 sm:p-3 ${(!nativeBalance || nativeBalance.value < BigInt('100000000000000'))
                    ? 'border-[#EF4444]/50 animate-pulse'
                    : 'border-[#334155]'
                    }`}>
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">⛽ BNB</p>
                    <p className={`text-sm sm:text-base font-bold ${(!nativeBalance || nativeBalance.value < BigInt('100000000000000'))
                        ? 'text-[#EF4444]'
                        : 'text-[#3B82F6]'
                        }`}>
                        {nativeBalance ? Number(formatUnits(nativeBalance.value, 18)).toFixed(4) : '0.0000'}
                    </p>
                    {(!nativeBalance || nativeBalance.value < BigInt('100000000000000')) && (
                        <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Need gas</p>
                    )}
                </div>

                {/* Daily Limit - Show Actual Remaining */}
                <div className={`bg-gradient-to-br from-[#1E293B] to-[#0F172A] border rounded-lg p-2 sm:p-3 ${actualRemainingLimit < BigInt('10000000000000000000')
                    ? 'border-[#F59E0B]/50'
                    : 'border-[#334155]'
                    }`}>
                    <p className="text-[8px] sm:text-[10px] text-[#64748B] mb-1">📊 Daily Limit</p>
                    <p className={`text-sm sm:text-base font-bold ${actualRemainingLimit === BigInt(0)
                        ? 'text-[#EF4444]'
                        : 'text-[#EC4899]'
                        }`}>
                        {formatUSD(actualRemainingLimit)}
                    </p>
                    {actualRemainingLimit === BigInt(0) && (
                        <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Limit reached</p>
                    )}
                </div>
            </div>

            {/* Reset Timer */}
            <ResetTimer dayStart={dayStart as bigint} dayLengthSeconds={dayLength as bigint} />

            {/* Trading Milestone Tracker */}
            {(() => {
                // Use targetUserId in lookup mode, otherwise use logged-in userId
                const displayUserId = isLookupMode ? targetUserId : userId;
                const userIdBigint = displayUserId && typeof displayUserId === 'bigint' ? displayUserId : null;
                return userIdBigint && userIdBigint > BigInt(0) && weekNumber > 0 ? (
                    <TradingMilestoneTracker userId={userIdBigint} weekNumber={weekNumber} />
                ) : null;
            })()}

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
            ) : marketplaceLoading ? (
                <div className="text-center py-12">
                    <p className="text-5xl mb-4">⏳</p>
                    <p className="text-[#64748B]">Loading marketplace NFTs...</p>
                </div>
            ) : displayNFTs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-[#F8FAFC] font-bold mb-2">No NFTs Available</p>
                    <p className="text-[#64748B]">All NFTs are currently held in queues</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {displayNFTs.map((nft) => (
                        <NFTCard
                            key={nft.nft_id}
                            nft={nft}
                            userId={userId as bigint}
                            onSelect={handleSelectNFT}
                            controls={nftControls}
                            isLookupMode={isLookupMode}
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

            {/* NFT Details Modal - Portal to body for full screen coverage */}
            {isModalOpen && selectedNFT && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-8 overflow-y-auto"
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
                        <div className="mb-4 flex justify-center">
                            <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#EC4899]/30">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899]/30 to-[#EF4444]/30 blur-3xl" />
                                <img
                                    src={`/bulls/bull${((selectedNFT.nftId - 1) % 11) + 1}.${((selectedNFT.nftId - 1) % 11) + 1 >= 10 ? 'jpg' : 'png'}`}
                                    alt={`Bull NFT #${selectedNFT.nftId}`}
                                    className="relative w-full h-full object-cover scale-110 drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-4">
                            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#F59E0B]">
                                ${Number(formatUnits(selectedNFT.currentPrice, 18)).toFixed(2)}
                            </p>
                        </div>

                        {/* Balance Display in Modal */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {/* USDT Balance */}
                            <div className={`bg-[#0F172A] border rounded-lg p-2 ${(usdtBalance as bigint || BigInt(0)) < selectedNFT.currentPrice
                                ? 'border-[#EF4444] animate-pulse'
                                : 'border-[#334155]'
                                }`}>
                                <p className="text-[8px] text-[#64748B] mb-1">💰 USDT</p>
                                <p className={`text-xs font-bold ${(usdtBalance as bigint || BigInt(0)) < selectedNFT.currentPrice
                                    ? 'text-[#EF4444]'
                                    : 'text-[#10B981]'
                                    }`}>
                                    ${Number(formatUnits(usdtBalance as bigint || BigInt(0), 18)).toFixed(2)}
                                </p>
                                {(usdtBalance as bigint || BigInt(0)) < selectedNFT.currentPrice && (
                                    <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Low</p>
                                )}
                            </div>

                            {/* BNB Balance */}
                            <div className={`bg-[#0F172A] border rounded-lg p-2 ${(!nativeBalance || nativeBalance.value < BigInt('100000000000000'))
                                ? 'border-[#EF4444] animate-pulse'
                                : 'border-[#334155]'
                                }`}>
                                <p className="text-[8px] text-[#64748B] mb-1">⛽ BNB</p>
                                <p className={`text-xs font-bold ${(!nativeBalance || nativeBalance.value < BigInt('100000000000000'))
                                    ? 'text-[#EF4444]'
                                    : 'text-[#3B82F6]'
                                    }`}>
                                    {nativeBalance ? Number(formatUnits(nativeBalance.value, 18)).toFixed(4) : '0.0000'}
                                </p>
                                {(!nativeBalance || nativeBalance.value < BigInt('100000000000000')) && (
                                    <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Gas</p>
                                )}
                            </div>

                            {/* Daily Limit - Actual Remaining */}
                            <div className={`bg-[#0F172A] border rounded-lg p-2 ${actualRemainingLimit < selectedNFT.currentPrice
                                ? 'border-[#EF4444] animate-pulse'
                                : 'border-[#334155]'
                                }`}>
                                <p className="text-[8px] text-[#64748B] mb-1">📊 Limit</p>
                                <p className={`text-xs font-bold ${actualRemainingLimit < selectedNFT.currentPrice
                                    ? 'text-[#EF4444]'
                                    : 'text-[#EC4899]'
                                    }`}>
                                    ${Number(formatUnits(actualRemainingLimit, 18)).toFixed(2)}
                                </p>
                                {actualRemainingLimit < selectedNFT.currentPrice && (
                                    <p className="text-[8px] text-[#EF4444] mt-1">⚠️ Low</p>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3 animate-pulse">
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
                                disabled={buyPending || approvePending || isWaitingForApproval || !!error}
                                className="flex-1 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {buyPending || approvePending || isWaitingForApproval ? '⏳ Processing...' : error ? '🚫 Cannot Buy' : '⚡ Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
