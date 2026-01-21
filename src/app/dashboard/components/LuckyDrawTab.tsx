'use client';

import { formatUnits } from 'viem';
import {
    useUserId,
    useLuckyDrawPool,
    useUserLuckyDrawEntries,
    useTotalLuckyDrawEntries,
    useLuckyDrawThreshold
} from '@/hooks/useContracts';
import { useAccount } from 'wagmi';

export function LuckyDrawTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);

    // Get lucky draw pool info
    const { data: luckyDrawPool } = useLuckyDrawPool();

    // Parse pool data
    const poolBalance = luckyDrawPool ? (luckyDrawPool as [bigint, bigint, bigint])[0] : BigInt(0);
    const weekNumber = luckyDrawPool ? Number((luckyDrawPool as [bigint, bigint, bigint])[1]) : 0;

    // Get user entries for current week
    const { data: userEntries } = useUserLuckyDrawEntries(userId as bigint, weekNumber);

    // Get total entries for current week
    const { data: totalEntries } = useTotalLuckyDrawEntries(weekNumber);

    // Get entry threshold
    const { data: entryThreshold } = useLuckyDrawThreshold();

    const formatUSD = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    const myEntries = userEntries ? Number(userEntries) : 0;
    const totalWeeklyEntries = totalEntries ? Number(totalEntries) : 0;
    const winChance = totalWeeklyEntries > 0 ? ((myEntries / totalWeeklyEntries) * 100).toFixed(2) : '0';
    const thresholdAmount = entryThreshold ? Number(formatUnits(entryThreshold as bigint, 18)) : 100;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2">
                        🎰 Lucky Draw
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Week #{weekNumber} - Trade to earn entries!</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                    { icon: '💰', label: 'Prize Pool', value: formatUSD(poolBalance), color: '#10B981' },
                    { icon: '🎫', label: 'My Entries', value: myEntries.toString(), color: '#EC4899' },
                    { icon: '📊', label: 'Total Entries', value: totalWeeklyEntries.toString(), color: '#3B82F6' },
                    { icon: '🎯', label: 'Win Chance', value: `${winChance}%`, color: '#D946EF' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            background: `linear-gradient(to bottom right, ${stat.color}20, #1E293B)`,
                            borderColor: `${stat.color}30`
                        }}
                    >
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">{stat.icon}</div>
                        <p className="text-[8px] sm:text-xs text-[#64748B]">{stat.label}</p>
                        <p className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* How to Get Entries */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 sm:p-5 md:p-6 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EC4899]/5 to-transparent" />
                <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-4 sm:mb-5 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🎫</span> How to Get Entries
                </h3>
                <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
                    {[
                        { icon: '🛒', label: 'Buy NFT', color: '#EC4899' },
                        { icon: '➡️', label: '' },
                        { icon: '💵', label: `$${thresholdAmount}`, color: '#3B82F6' },
                        { icon: '=', label: '' },
                        { icon: '🎫', label: '1 Entry', color: '#10B981', glow: true },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center min-w-[40px] sm:min-w-[50px]">
                            <span className={`text-lg sm:text-2xl md:text-3xl ${step.glow ? 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}`}>
                                {step.icon}
                            </span>
                            {step.label && (
                                <span className="text-[8px] sm:text-xs mt-0.5 sm:mt-1 font-medium" style={{ color: step.color || '#64748B' }}>
                                    {step.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* My Entries Progress */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">📊 Your Entries This Week</h3>
                    <span className="text-lg sm:text-xl font-bold text-[#EC4899]">{myEntries}</span>
                </div>
                <div className="relative h-3 bg-[#0F172A] rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((myEntries / Math.max(totalWeeklyEntries, 1)) * 100, 100)}%` }}
                    />
                </div>
                <p className="text-[10px] sm:text-xs text-[#64748B] mt-2">
                    You have <span className="text-[#EC4899] font-bold">{winChance}%</span> chance of winning!
                </p>
            </div>

            {/* Info Alert */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#10B981]/20 to-[#1E293B] border border-[#10B981]/30 rounded-xl p-3 sm:p-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-2xl sm:text-3xl opacity-20">💡</div>
                <p className="text-[10px] sm:text-sm text-[#10B981]">
                    <strong>💡 Tip:</strong> Every <span className="text-[#EC4899] font-bold">${thresholdAmount}</span> trading volume = <span className="text-[#3B82F6] font-bold">1 entry</span>. Winner gets the entire prize pool!
                </p>
            </div>
        </div>
    );
}
