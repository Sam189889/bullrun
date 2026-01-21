'use client';

import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useUserId, useUserEarnings, useUserBalance, useWithdraw } from '@/hooks/useContracts';
import { useIncomeEvents, useRankEmiClaimedEvents, useFastBonusClaimedEvents, IncomeEvent, RankEmiClaimedEvent, FastBonusClaimedEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const MIN_WITHDRAWAL = parseUnits('5', 18); // $5 minimum

// Expandable income card component
function IncomeCard({
    type,
    amount,
    icon,
    color,
    incomeTypeFilter,
    userId
}: {
    type: string;
    amount: bigint;
    icon: string;
    color: string;
    incomeTypeFilter?: string;
    userId: bigint | undefined;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch events based on income type
    const { events: incomeEvents, isLoading: incomeLoading } = useIncomeEvents(userId);
    const { events: emiEvents, isLoading: emiLoading } = useRankEmiClaimedEvents(userId);
    const { events: fastBonusEvents, isLoading: fastBonusLoading } = useFastBonusClaimedEvents(userId);

    // Filter events based on income type
    const getFilteredEvents = () => {
        if (type === 'Rank EMI') {
            return emiEvents.map(e => ({
                amount: e.amount,
                details: `EMI #${e.emiNumber} - Rank ${e.rank}`,
                txHash: e.transactionHash,
            }));
        }
        if (type === 'Fast Bonus') {
            return fastBonusEvents.map(e => ({
                amount: e.amount,
                details: `Rank ${e.rank} Fast Bonus`,
                txHash: e.transactionHash,
            }));
        }
        // Direct Sponsor or Level Income - filter from IncomeDistributed events
        const filterType = type === 'Direct Sponsor' ? 'DIRECT_SPONSOR' : 'LEVEL_INCOME';
        return incomeEvents
            .filter(e => e.incomeType === filterType)
            .map(e => ({
                amount: e.amount,
                details: `From User #${e.fromUserId}`,
                txHash: e.transactionHash,
            }));
    };

    const filteredEvents = getFilteredEvents();
    const isLoading = incomeLoading || emiLoading || fastBonusLoading;

    const formatUSDT = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    return (
        <div className="border-b border-[#334155] last:border-b-0">
            {/* Header - Clickable */}
            <div
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-[#F8FAFC]">{type}</p>
                        <p className="text-[8px] sm:text-xs text-[#64748B]">
                            {filteredEvents.length} transactions • Click to expand
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-xs sm:text-sm font-mono font-bold" style={{ color }}>
                            {formatUSDT(amount)}
                        </p>
                    </div>
                    <span className={`text-[#64748B] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </div>

            {/* Expanded History */}
            {isExpanded && (
                <div className="bg-[#0F172A] border-t border-[#334155]">
                    {isLoading ? (
                        <div className="p-4 text-center text-[#64748B]">Loading history...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="p-4 text-center text-[#64748B] text-sm">No history yet</div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto">
                            {filteredEvents.slice(0, 10).map((event, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between px-4 py-2 hover:bg-[#1E293B]/30 border-b border-[#1E293B] last:border-b-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px]" style={{ color }}>●</span>
                                        <span className="text-[10px] sm:text-xs text-[#94A3B8]">{event.details}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] sm:text-xs font-mono font-bold" style={{ color }}>
                                            +{formatUSDT(event.amount)}
                                        </span>
                                        <a
                                            href={`https://testnet.opbnbscan.com/tx/${event.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-[#64748B] hover:text-[#EC4899]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            🔗
                                        </a>
                                    </div>
                                </div>
                            ))}
                            {filteredEvents.length > 10 && (
                                <div className="p-2 text-center text-[10px] text-[#64748B]">
                                    Showing 10 of {filteredEvents.length} transactions
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function EarningsTab() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const { address } = useAccount();

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: earnings, isLoading } = useUserEarnings(userId as bigint);
    const { data: balanceData, refetch: refetchBalance } = useUserBalance(userId as bigint);

    // Withdraw hook
    const { withdraw, isPending: isWithdrawing, data: withdrawHash } = useWithdraw();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

    const balance = balanceData as readonly [bigint, bigint, bigint] | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Parse balance struct (totalEarned, availableBalance, withdrawnBalance)
    const totalEarned = balance ? balance[0] : BigInt(0);
    const availableBalance = balance ? balance[1] : BigInt(0);
    const withdrawnBalance = balance ? balance[2] : BigInt(0);

    // Parse earnings - contract returns tuple (directSponsor, levelIncome, rankEmi, fastBonus)
    const earnTuple = earnings as readonly [bigint, bigint, bigint, bigint] | undefined;
    const directSponsor = earnTuple ? earnTuple[0] : BigInt(0);
    const levelIncome = earnTuple ? earnTuple[1] : BigInt(0);
    const rankEmi = earnTuple ? earnTuple[2] : BigInt(0);
    const fastBonus = earnTuple ? earnTuple[3] : BigInt(0);

    // Format values
    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    // Calculate totals from earnings
    const totalEarnings = directSponsor + levelIncome + rankEmi + fastBonus;

    // Handle withdraw
    const handleWithdraw = () => {
        if (!withdrawAmount) return;
        const amount = parseUnits(withdrawAmount, 18);
        if (amount < MIN_WITHDRAWAL) {
            toast.error('Minimum withdrawal is $5');
            return;
        }
        if (amount > availableBalance) {
            toast.error('Insufficient balance');
            return;
        }
        withdraw(amount);
        toast.success('Withdrawal submitted!');
    };

    // Handle max withdraw
    const handleMaxWithdraw = () => {
        if (availableBalance > BigInt(0)) {
            setWithdrawAmount(formatUnits(availableBalance, 18));
        }
    };

    // Success handling
    if (isSuccess) {
        refetchBalance();
        setWithdrawAmount('');
        toast.success('Withdrawal successful!');
    }

    // Earnings breakdown for display
    const earningsData = [
        { type: 'Direct Sponsor', amount: directSponsor, icon: '🤝', color: '#EC4899' },
        { type: 'Level Income', amount: levelIncome, icon: '📈', color: '#3B82F6' },
        { type: 'Rank EMI', amount: rankEmi, icon: '🏆', color: '#10B981' },
        { type: 'Fast Bonus', amount: fastBonus, icon: '⚡', color: '#D946EF' },
    ];

    // Filter earnings
    const filteredEarnings = activeFilter === 'All'
        ? earningsData
        : earningsData.filter(e => e.type.toLowerCase().includes(activeFilter.toLowerCase()));

    const EARNING_TYPES = ['All', 'Sponsor', 'Level', 'Rank EMI', 'Fast Bonus'];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#10B981]">
                        {isLoading ? '...' : formatUSDT(totalEarnings)}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                    style={{
                        animationDelay: '0.1s',
                        background: 'linear-gradient(to bottom right, #EC489920, #1E293B)',
                        borderColor: '#EC489930'
                    }}
                >
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">💸</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Withdrawable</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#EC4899]">
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
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Withdrawn</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#3B82F6]">
                        {formatUSDT(withdrawnBalance)}
                    </p>
                </div>
            </div>

            {/* Withdraw Section */}
            <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">💰 Withdraw</h3>
                    <span className="text-xs text-[#64748B]">Min: $5</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">$</span>
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-7 pr-14 py-2 text-[#F8FAFC] text-sm focus:border-[#EC4899] outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleMaxWithdraw}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#EC4899] hover:text-[#D946EF]"
                        >
                            MAX
                        </button>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || isConfirming || !withdrawAmount}
                        className="px-4"
                    >
                        {isWithdrawing || isConfirming ? '...' : 'Withdraw'}
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

            {/* Earnings Breakdown with Expandable History */}
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
        </div>
    );
}
