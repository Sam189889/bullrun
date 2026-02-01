'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useUserId, useUserEarnings, useUserTradingEarnings, useUserBalance, useWithdraw, useLuckyDrawPool, useUserLuckyDrawEntries, useTotalLuckyDrawEntries, useLuckyDrawThreshold, useCurrentWeek, useUserWeeklyShares, useTotalWeeklyShares, useWeeklyPoolBalance, useTradingShareThreshold, useTradingSharesPerThreshold, useUserNftRefunds } from '@/hooks/useContracts';
import { Button } from '@/components/ui/Button';
import { IncomeHistoryModal } from './IncomeHistoryModal';
import toast from 'react-hot-toast';

const MIN_CLAIM = parseUnits('5', 18); // $5 minimum

// Simple income card component (click to open modal)
function IncomeCard({
    type,
    amount,
    icon,
    color,
    userId,
    onOpenModal
}: {
    type: string;
    amount: bigint;
    icon: string;
    color: string;
    userId: bigint | undefined;
    onOpenModal: () => void;
}) {
    const formatUSDT = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    return (
        <div className="border-b border-[#334155] last:border-b-0">
            {/* Header - Clickable to open modal */}
            <div
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors cursor-pointer active:scale-[0.99]"
                onClick={onOpenModal}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">{type}</p>
                        <p className="text-[8px] sm:text-xs text-[#64748B]">
                            Click to view history
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm sm:text-base font-mono font-bold" style={{ color }}>
                            {formatUSDT(amount)}
                        </p>
                    </div>
                    <span className="text-[#64748B]">→</span>
                </div>
            </div>
        </div>
    );
}

export function EarningsTab() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [claimAmount, setClaimAmount] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState<{ type: string; icon: string; color: string } | null>(null);
    const { address } = useAccount();

    const openModal = (type: string, icon: string, color: string) => {
        setSelectedIncome({ type, icon, color });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedIncome(null);
    };

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: earnings, isLoading } = useUserEarnings(userId as bigint);
    const { data: tradingEarnings, isLoading: isTradingLoading } = useUserTradingEarnings(userId as bigint);
    const { data: nftRefundsData } = useUserNftRefunds(userId as bigint);
    const { data: balanceData, refetch: refetchBalance } = useUserBalance(userId as bigint);

    // Claim hook
    const { withdraw, isPending: isClaiming, data: claimHash } = useWithdraw();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    const balance = balanceData as readonly [bigint, bigint, bigint] | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Get current week first (used by both Lucky Draw and Share Pool)
    const { data: currentWeek } = useCurrentWeek();
    const weekNumber = currentWeek ? Number(currentWeek) : 0;

    // Lucky Draw Data
    const { data: luckyDrawPool } = useLuckyDrawPool();
    // luckyDrawPool returns (balance, lastDrawAt) - NOT weekNumber!
    const poolBalance = luckyDrawPool ? (luckyDrawPool as [bigint, bigint])[0] : BigInt(0);
    const { data: userEntries } = useUserLuckyDrawEntries(userId as bigint, weekNumber);
    const { data: totalEntries } = useTotalLuckyDrawEntries(weekNumber);
    const { data: entryThreshold } = useLuckyDrawThreshold();

    const myEntries = userEntries ? Number(userEntries) : 0;
    const totalWeeklyEntries = totalEntries ? Number(totalEntries) : 0;
    const winChance = totalWeeklyEntries > 0 ? ((myEntries / totalWeeklyEntries) * 100).toFixed(2) : '0';
    const thresholdAmount = entryThreshold ? Number(formatUnits(entryThreshold as bigint, 18)) : 100;

    // Share Pool Data (uses same weekNumber from getCurrentWeek)
    const shareWeekNumber = weekNumber;
    const { data: sharePoolBalance } = useWeeklyPoolBalance();
    const { data: totalShares } = useTotalWeeklyShares();
    const { data: userShares } = useUserWeeklyShares(userId as bigint, shareWeekNumber);
    const { data: shareThreshold } = useTradingShareThreshold();
    const { data: sharesPerThreshold } = useTradingSharesPerThreshold();

    const myShares = userShares ? Number(userShares) : 0;
    const totalWeeklyShares = totalShares ? Number(totalShares) : 0;
    const sharePercentage = totalWeeklyShares > 0 ? ((myShares / totalWeeklyShares) * 100).toFixed(2) : '0';
    const shareThresholdAmount = shareThreshold ? Number(formatUnits(shareThreshold as bigint, 18)) : 1000;
    const sharesPerTrade = sharesPerThreshold ? Number(sharesPerThreshold) : 2;

    // Parse balance struct (totalEarned, availableBalance, claimedBalance)
    const totalEarned = balance ? balance[0] : BigInt(0);
    const availableBalance = balance ? balance[1] : BigInt(0);
    const claimedBalance = balance ? balance[2] : BigInt(0);

    // Parse earnings - contract returns tuple (directSponsor, levelIncome, rankEmi, fastBonus)
    const earnTuple = earnings as readonly [bigint, bigint, bigint, bigint] | undefined;
    const directSponsor = earnTuple ? earnTuple[0] : BigInt(0);
    const levelIncome = earnTuple ? earnTuple[1] : BigInt(0);
    const rankEmi = earnTuple ? earnTuple[2] : BigInt(0);
    const fastBonus = earnTuple ? earnTuple[3] : BigInt(0);

    // Parse trading earnings - contract returns tuple (tradingLevelBonus, nftProfit, luckyDraw, tripReward)
    const tradingTuple = tradingEarnings as readonly [bigint, bigint, bigint, bigint] | undefined;
    const tradingLevelBonus = tradingTuple ? tradingTuple[0] : BigInt(0);
    const nftProfit = tradingTuple ? tradingTuple[1] : BigInt(0);
    const luckyDrawWinnings = tradingTuple ? tradingTuple[2] : BigInt(0);
    const tripReward = tradingTuple ? tradingTuple[3] : BigInt(0);

    // NFT sale refunds (separate mapping, not in struct)
    const nftRefunds = nftRefundsData ? (nftRefundsData as bigint) : BigInt(0);

    // Format values
    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    // Calculate totals from both package and trading earnings
    const packageTotal = directSponsor + levelIncome + rankEmi + fastBonus;
    const tradingTotal = tradingLevelBonus + nftProfit + luckyDrawWinnings + tripReward + nftRefunds;
    const totalEarnings = packageTotal + tradingTotal;

    // Handle claim
    const handleClaim = () => {
        if (!claimAmount) return;
        const amount = parseUnits(claimAmount, 18);
        if (amount < MIN_CLAIM) {
            toast.error('Minimum claim is $5');
            return;
        }
        if (amount > availableBalance) {
            toast.error('Insufficient balance');
            return;
        }
        withdraw(amount);
        toast.success('Claim submitted!');
    };

    // Handle max claim
    const handleMaxClaim = () => {
        if (availableBalance > BigInt(0)) {
            setClaimAmount(formatUnits(availableBalance, 18));
        }
    };

    // Success handling in useEffect
    const toastShown = useRef(false);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            refetchBalance();
            setClaimAmount('');
            toast.success('Claim successful!');
        }
    }, [isSuccess, refetchBalance]);

    // Earnings breakdown for display
    const packageEarningsData = [
        { type: 'Direct Sponsor', amount: directSponsor, icon: '🤝', color: '#EC4899', category: 'package' },
        { type: 'Level Income', amount: levelIncome, icon: '📈', color: '#3B82F6', category: 'package' },
        { type: 'Rank EMI', amount: rankEmi, icon: '🏆', color: '#10B981', category: 'package' },
        { type: 'Fast Bonus', amount: fastBonus, icon: '⚡', color: '#D946EF', category: 'package' },
    ];

    const tradingEarningsData = [
        { type: 'Trading Level Bonus', amount: tradingLevelBonus, icon: '💹', color: '#F59E0B', category: 'trading' },
        { type: 'NFT Profit', amount: nftProfit, icon: '🎨', color: '#8B5CF6', category: 'trading' },
        { type: 'Lucky Draw', amount: luckyDrawWinnings, icon: '🎰', color: '#06B6D4', category: 'trading' },
        { type: 'Trip Reward', amount: tripReward, icon: '✈️', color: '#14B8A6', category: 'trading' },
    ];

    const allEarningsData = [...packageEarningsData, ...tradingEarningsData];

    // Filter earnings
    const filteredEarnings = activeFilter === 'All'
        ? allEarningsData
        : activeFilter === 'Package'
            ? packageEarningsData
            : activeFilter === 'Trading'
                ? tradingEarningsData
                : allEarningsData.filter(e => e.type.toLowerCase().includes(activeFilter.toLowerCase()));

    const EARNING_TYPES = ['All', 'Package', 'Trading'];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Lucky Draw Section (New Part) */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-[#334155] p-1 overflow-hidden animate-slide-up">
                <div className="bg-[#1E293B]/50 p-3 sm:p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg">🎰</span>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-white">Lucky Draw</h3>
                                <p className="text-[10px] text-[#64748B]">Week #{weekNumber}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#64748B] uppercase">Prize Pool</p>
                            <p className="text-lg font-bold text-[#10B981]">{formatUSDT(poolBalance)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#334155]">
                            <p className="text-[10px] text-[#64748B] uppercase">My Entries</p>
                            <p className="text-sm font-bold text-[#EC4899]">{myEntries} 🎫</p>
                        </div>
                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#334155]">
                            <p className="text-[10px] text-[#64748B] uppercase">Win Chance</p>
                            <p className="text-sm font-bold text-[#3B82F6]">{winChance}% 🔥</p>
                        </div>
                    </div>

                    <div className="bg-[#10B981]/10 rounded-lg p-2.5 border border-[#10B981]/20">
                        <p className="text-[10px] text-[#10B981]">
                            <strong>Tip:</strong> Every <span className="font-bold">${thresholdAmount}</span> trading volume = 1 entry!
                        </p>
                    </div>
                </div>
            </div>

            {/* Share Pool Section */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-[#334155] p-1 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-[#1E293B]/50 p-3 sm:p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg">📊</span>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-white">Share Pool</h3>
                                <p className="text-[10px] text-[#64748B]">Week #{shareWeekNumber}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#64748B] uppercase">Pool Balance</p>
                            <p className="text-lg font-bold text-[#10B981]">{formatUSDT(sharePoolBalance as bigint)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#334155]">
                            <p className="text-[10px] text-[#64748B] uppercase">My Shares</p>
                            <p className="text-sm font-bold text-[#EC4899]">{myShares} ⭐</p>
                        </div>
                        <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#334155]">
                            <p className="text-[10px] text-[#64748B] uppercase">My Share %</p>
                            <p className="text-sm font-bold text-[#3B82F6]">{sharePercentage}% 🎯</p>
                        </div>
                    </div>

                    <div className="bg-[#10B981]/10 rounded-lg p-2.5 border border-[#10B981]/20">
                        <p className="text-[10px] text-[#10B981]">
                            <strong>Tip:</strong> Trade <span className="font-bold">${shareThresholdAmount}</span> = +{sharesPerTrade} shares | Sponsor = +1 share | CALF Rank = +5 shares
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0s',
                        background: 'linear-gradient(to bottom right, #10B98120, #1E293B)',
                        borderColor: '#10B98130'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">💰</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Total Earnings</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#10B981]">
                        {isLoading || isTradingLoading ? '...' : formatUSDT(totalEarnings)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.05s',
                        background: 'linear-gradient(to bottom right, #EC489920, #1E293B)',
                        borderColor: '#EC489930'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">�</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Package</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#EC4899]">
                        {isLoading ? '...' : formatUSDT(packageTotal)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.1s',
                        background: 'linear-gradient(to bottom right, #F59E0B20, #1E293B)',
                        borderColor: '#F59E0B30'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">💹</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Trading</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#F59E0B]">
                        {isTradingLoading ? '...' : formatUSDT(tradingTotal)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.15s',
                        background: 'linear-gradient(to bottom right, #8B5CF620, #1E293B)',
                        borderColor: '#8B5CF630'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">�💸</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Claimable</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#8B5CF6]">
                        {formatUSDT(availableBalance)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.2s',
                        background: 'linear-gradient(to bottom right, #3B82F620, #1E293B)',
                        borderColor: '#3B82F630'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">✅</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Claimed</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#3B82F6]">
                        {formatUSDT(claimedBalance)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.25s',
                        background: 'linear-gradient(to bottom right, #22C55E20, #1E293B)',
                        borderColor: '#22C55E30'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">💰</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">NFT Refunds</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#22C55E]">
                        {formatUSDT(nftRefunds)}
                    </p>
                </div>
            </div>

            {/* Claim Section */}
            <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">💰 Claim</h3>
                    <span className="text-xs text-[#64748B]">Min: $5</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">$</span>
                        <input
                            type="number"
                            value={claimAmount}
                            onChange={(e) => setClaimAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-7 pr-14 py-2 text-[#F8FAFC] text-sm focus:border-[#EC4899] outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleMaxClaim}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#EC4899] hover:text-[#D946EF]"
                        >
                            MAX
                        </button>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleClaim}
                        disabled={isClaiming || isConfirming || !claimAmount}
                        className="px-4"
                    >
                        {isClaiming || isConfirming ? '...' : 'Claim'}
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {EARNING_TYPES.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`
                            px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 active:scale-95
                            ${activeFilter === tab
                                ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A] shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:border-[#EC4899]/50'
                            }
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Earnings Breakdown - Click to open modal */}
            {isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    {filteredEarnings.length > 0 ? (
                        filteredEarnings.map((item, index) => (
                            <IncomeCard
                                key={index}
                                type={item.type}
                                amount={item.amount}
                                icon={item.icon}
                                color={item.color}
                                userId={userId as bigint}
                                onOpenModal={() => openModal(item.type, item.icon, item.color)}
                            />
                        ))
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-[#64748B]">No earnings yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Not Registered */}
            {!isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-6 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <p className="text-4xl mb-3">📊</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Track Your Earnings</h3>
                    <p className="text-sm text-[#64748B]">Register to start earning with Bull Run</p>
                </div>
            )}

            {/* Income History Modal */}
            {selectedIncome && (
                <IncomeHistoryModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    type={selectedIncome.type}
                    userId={userId as bigint}
                    color={selectedIncome.color}
                    icon={selectedIncome.icon}
                />
            )}
        </div>
    );
}
