'use client';

import { StatCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserEarnings, useUserBalance } from '@/hooks/useContracts';

// Define types for contract returns
interface UserInfo {
    referrerId: bigint;
    packageLevel: bigint;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    activationDate: bigint;
    directReferralsCount: bigint;
}

interface UserEarnings {
    directSponsor: bigint;
    levelIncome: bigint;
    rankEmi: bigint;
    fastBonus: bigint;
}

interface UserBalance {
    totalEarned: bigint;
    availableBalance: bigint;
    withdrawnBalance: bigint;
}

export function HomeTab() {
    const { address, isConnected } = useAccount();

    // Fetch user data from contract
    const { data: userId } = useUserId(address);
    const { data: userInfo, isLoading: infoLoading } = useUserInfo(userId as bigint);
    const { data: earnings, isLoading: earningsLoading } = useUserEarnings(userId as bigint);
    const { data: balanceData } = useUserBalance(userId as bigint);

    // Parse user info
    const info = userInfo as UserInfo | undefined;

    // Parse earnings - contract returns array [directSponsor, levelIncome, rankEmi, fastBonus]
    const earnArr = earnings as readonly [bigint, bigint, bigint, bigint] | undefined;
    const earn = earnArr ? {
        directSponsor: earnArr[0],
        levelIncome: earnArr[1],
        rankEmi: earnArr[2],
        fastBonus: earnArr[3],
    } : undefined;

    // Parse balance - contract returns array [totalEarned, availableBalance, withdrawnBalance]
    const balArr = balanceData as readonly [bigint, bigint, bigint] | undefined;
    const balance = balArr ? {
        totalEarned: balArr[0],
        availableBalance: balArr[1],
        withdrawnBalance: balArr[2],
    } : undefined;

    // Calculate total income
    const totalIncome = earn ?
        Number(formatUnits(earn.directSponsor + earn.levelIncome + earn.rankEmi + earn.fastBonus, 18)) : 0;

    // Format values
    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    const isLoading = infoLoading || earningsLoading;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EC4899]/20 via-[#1E293B] to-[#D946EF]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#EC4899]/30 animate-slide-up">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 text-5xl sm:text-6xl opacity-10 float-slow">🐂</div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC] mb-1 sm:mb-2">
                        {Boolean(isRegistered) ? (
                            <>Welcome, <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">User #{userId?.toString()}</span></>
                        ) : (
                            <>Welcome to <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Bull Run!</span></>
                        )}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                        {isRegistered && info?.isActive ? '✅ Account Active' : isRegistered ? '⏳ Account Pending Activation' : '🔗 Connect wallet to get started'}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div
                    className="animate-slide-up bg-gradient-to-br rounded-xl p-3 sm:p-4 border card-hover group"
                    style={{
                        animationDelay: '0s',
                        background: 'linear-gradient(to bottom right, #EC489915, #1E293B)',
                        borderColor: '#EC489930'
                    }}
                >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">💰</span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#EC4899]">
                        {isLoading ? '...' : `$${totalIncome.toFixed(2)}`}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Total Income</p>
                </div>

                <div
                    className="animate-slide-up bg-gradient-to-br rounded-xl p-3 sm:p-4 border card-hover group"
                    style={{
                        animationDelay: '0.1s',
                        background: 'linear-gradient(to bottom right, #10B98115, #1E293B)',
                        borderColor: '#10B98130'
                    }}
                >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">💸</span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#10B981]">
                        {formatUSDT(balance?.availableBalance as bigint)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Withdrawable</p>
                </div>

                <div
                    className="animate-slide-up bg-gradient-to-br rounded-xl p-3 sm:p-4 border card-hover group"
                    style={{
                        animationDelay: '0.2s',
                        background: 'linear-gradient(to bottom right, #3B82F615, #1E293B)',
                        borderColor: '#3B82F630'
                    }}
                >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">📦</span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3B82F6]">
                        {info ? `$${Number(formatUnits(info.totalInvested, 18))}` : '$0'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Package</p>
                </div>

                <div
                    className="animate-slide-up bg-gradient-to-br rounded-xl p-3 sm:p-4 border card-hover group"
                    style={{
                        animationDelay: '0.3s',
                        background: 'linear-gradient(to bottom right, #D946EF15, #1E293B)',
                        borderColor: '#D946EF30'
                    }}
                >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">👥</span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D946EF]">
                        {info ? String(info.directReferralsCount) : '0'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Direct Referrals</p>
                </div>
            </div>

            {/* Earnings Breakdown */}
            {isRegistered && earn && (
                <div className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-4 sm:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-sm sm:text-base font-semibold text-[#F8FAFC] mb-3">💰 Earnings Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-[#0F172A] rounded-lg">
                            <p className="text-[10px] text-[#64748B]">Direct Sponsor</p>
                            <p className="text-sm font-bold text-[#EC4899]">{formatUSDT(earn.directSponsor)}</p>
                        </div>
                        <div className="p-3 bg-[#0F172A] rounded-lg">
                            <p className="text-[10px] text-[#64748B]">Level Income</p>
                            <p className="text-sm font-bold text-[#3B82F6]">{formatUSDT(earn.levelIncome)}</p>
                        </div>
                        <div className="p-3 bg-[#0F172A] rounded-lg">
                            <p className="text-[10px] text-[#64748B]">Rank EMI</p>
                            <p className="text-sm font-bold text-[#10B981]">{formatUSDT(earn.rankEmi)}</p>
                        </div>
                        <div className="p-3 bg-[#0F172A] rounded-lg">
                            <p className="text-[10px] text-[#64748B]">Fast Bonus</p>
                            <p className="text-sm font-bold text-[#D946EF]">{formatUSDT(earn.fastBonus)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                {[
                    { icon: '🛒', label: 'Buy', color: '#EC4899' },
                    { icon: '💸', label: 'Withdraw', color: '#10B981' },
                    { icon: '👥', label: 'Invite', color: '#3B82F6' },
                    { icon: '📊', label: 'Reports', color: '#D946EF' },
                ].map((action, index) => (
                    <button
                        key={index}
                        className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] hover:border-[#EC4899]/50 transition-all duration-300 card-hover group active:scale-95"
                    >
                        <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-300">{action.icon}</span>
                        <span className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC] font-medium">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Not Registered Message */}
            {!isRegistered && isConnected && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-6 border border-[#334155] text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <p className="text-4xl mb-3">🚀</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Get Started!</h3>
                    <p className="text-sm text-[#64748B] mb-4">Register now to start earning with Bull Run</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-xl text-white font-bold hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all active:scale-95">
                        Register Now
                    </button>
                </div>
            )}
        </div>
    );
}
