'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserEarnings, useUserBalance } from '@/hooks/useContracts';
import { Button } from '@/components/ui/Button';

// Define types for contract returns
interface UserEarnings {
    directSponsor: bigint;
    levelIncome: bigint;
    rankEmi: bigint;
    fastBonus: bigint;
}

const EARNING_TYPES = ['All', 'Sponsor', 'Level', 'Rank EMI', 'Fast Bonus'];

export function EarningsTab() {
    const [activeFilter, setActiveFilter] = useState('All');
    const { address } = useAccount();

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: earnings, isLoading } = useUserEarnings(userId as bigint);
    const { data: balance } = useUserBalance(userId as bigint);

    const earn = earnings as UserEarnings | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Format values
    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    // Calculate totals
    const totalEarnings = earn ?
        earn.directSponsor + earn.levelIncome + earn.rankEmi + earn.fastBonus : BigInt(0);

    // Earnings breakdown for display
    const earningsData = earn ? [
        { type: 'Direct Sponsor', amount: earn.directSponsor, icon: '🤝', color: '#EC4899' },
        { type: 'Level Income', amount: earn.levelIncome, icon: '📈', color: '#3B82F6' },
        { type: 'Rank EMI', amount: earn.rankEmi, icon: '🏆', color: '#10B981' },
        { type: 'Fast Bonus', amount: earn.fastBonus, icon: '⚡', color: '#D946EF' },
    ] : [];

    // Filter earnings
    const filteredEarnings = activeFilter === 'All'
        ? earningsData
        : earningsData.filter(e => e.type.toLowerCase().includes(activeFilter.toLowerCase()));

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
                        {formatUSDT(balance as bigint)}
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
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">📊</div>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Income Types</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#3B82F6]">
                        {earningsData.filter(e => e.amount > BigInt(0)).length}
                    </p>
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

            {/* Earnings Breakdown */}
            {isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="divide-y divide-[#334155]">
                        {filteredEarnings.length > 0 ? (
                            filteredEarnings.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg"
                                            style={{ backgroundColor: `${item.color}20` }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm text-[#F8FAFC]">{item.type}</p>
                                            <p className="text-[8px] sm:text-xs text-[#64748B]">Accumulated</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm font-mono font-bold" style={{ color: item.color }}>
                                            {formatUSDT(item.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-[#64748B]">No earnings yet</p>
                            </div>
                        )}
                    </div>
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

            {/* Withdraw Button */}
            {isRegistered && typeof balance === 'bigint' && balance > BigInt(0) && (
                <Button
                    variant="primary"
                    className="w-full py-3 sm:py-4"
                >
                    💸 Withdraw {formatUSDT(balance as bigint)}
                </Button>
            )}
        </div>
    );
}
