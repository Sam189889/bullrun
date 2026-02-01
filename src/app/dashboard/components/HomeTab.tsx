'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserEarnings, useUserBalance, useUserDailyLimitData, useUserAvailableLimit } from '@/hooks/useContracts';
import { useDayStartTimestamp, useDayLength } from '@/hooks/useAdminContracts';
import { SmartPackageCard } from './SmartPackageCard';

// Define types for contract returns
interface UserInfo {
    referrerId: bigint;
    packageLevel: bigint;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    activationDate: bigint;
    directReferralsCount: bigint;
    usernameId: bigint;
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
    claimedBalance: bigint;
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
            const elapsed = now - start;
            const currentDayNum = Math.floor(elapsed / length);
            const nextReset = start + ((currentDayNum + 1) * length);
            const secondsLeft = nextReset - now;

            if (secondsLeft <= 0) return '00:00:00';

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
        <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#EF4444]/10 border border-[#F59E0B]/30 rounded-lg p-3">
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

export function HomeTab() {
    const { address, isConnected } = useAccount();
    const [copied, setCopied] = useState(false);

    // Fetch user data from contract
    const { data: userId } = useUserId(address);
    const { data: userInfo, isLoading: infoLoading } = useUserInfo(userId as bigint);
    const { data: earnings, isLoading: earningsLoading } = useUserEarnings(userId as bigint);
    const { data: balanceData } = useUserBalance(userId as bigint);
    const { data: dailyLimitData } = useUserDailyLimitData(userId as bigint);
    const { data: availableLimit } = useUserAvailableLimit(userId as bigint);

    // Day settings for timer
    const { data: dayStart } = useDayStartTimestamp();
    const { data: dayLength } = useDayLength();

    // Calculate daily trade limit - USE availableLimit from contract (handles day reset)
    const dailyLimit = dailyLimitData as readonly [bigint, bigint, bigint] | undefined;
    const totalDailyLimit = dailyLimit ? dailyLimit[0] : BigInt(0);
    // Use availableLimit from contract (properly handles day reset)
    const remainingDailyLimit = availableLimit ? (availableLimit as bigint) : BigInt(0);
    const usedDailyLimit = totalDailyLimit - remainingDailyLimit; // Calculate from available

    // Referral link - using wallet address
    const referralLink = typeof window !== 'undefined' && address
        ? `${window.location.origin}/register?ref=${address}`
        : '';

    // Truncated display version (show first 20 + last 8 chars of wallet)
    const displayLink = typeof window !== 'undefined' && address
        ? `${window.location.origin.slice(0, 4)}...?ref=${address.slice(0, 4)}...${address.slice(-4)}`
        : '';

    const copyLink = () => {
        if (!isRegistered) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

    // Parse balance - contract returns array [totalEarned, availableBalance, claimedBalance]
    const balArr = balanceData as readonly [bigint, bigint, bigint] | undefined;
    const balance = balArr ? {
        totalEarned: balArr[0],
        availableBalance: balArr[1],
        claimedBalance: balArr[2],
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
                            <>Welcome, <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">BULL{info?.usernameId?.toString()}</span> 🐂</>
                        ) : (
                            <>Welcome to <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Bull Run!</span></>
                        )}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                        {isRegistered && info?.isActive ? '✅ Account Active' : isRegistered ? '⏳ Account Pending Activation' : '🔗 Connect wallet to get started'}
                    </p>
                </div>
            </div>

            {/* Referral Link Section */}
            {isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl sm:text-2xl">🔗</span>
                        <h3 className="text-sm sm:text-lg font-bold text-white">Your Referral Link</h3>
                    </div>
                    {/* Always side-by-side */}
                    <div className="flex flex-row gap-2 sm:gap-3">
                        <div className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 sm:py-3.5">
                            <p className="text-xs sm:text-sm text-[#94A3B8] font-mono">
                                {displayLink}
                            </p>
                        </div>
                        <button
                            onClick={copyLink}
                            className="px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-[#EC4899] to-[#D946EF] hover:from-[#D946EF] hover:to-[#EC4899] text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] whitespace-nowrap"
                        >
                            {copied ? '✓' : '📋'}
                        </button>
                    </div>
                    <p className="text-xs text-[#64748B] mt-3">
                        Share this link to earn 15% direct sponsor income + level bonuses!
                    </p>
                </div>
            )}

            {/* Reset Timer */}
            {isRegistered && (
                <ResetTimer dayStart={dayStart as bigint} dayLengthSeconds={dayLength as bigint} />
            )}

            {/* Daily Trade Limit Meter */}
            {isRegistered && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-xl p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl">📊</span>
                            <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">Daily Trade Limit</h3>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#EC4899]">
                            {totalDailyLimit > BigInt(0)
                                ? `${((Number(formatUnits(usedDailyLimit, 18)) / Number(formatUnits(totalDailyLimit, 18))) * 100).toFixed(1)}%`
                                : '0%'
                            }
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 sm:h-4 bg-[#0F172A] rounded-full overflow-hidden mb-2">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#10B981] to-[#3B82F6] rounded-full transition-all duration-500"
                            style={{
                                width: totalDailyLimit > BigInt(0)
                                    ? `${Math.min((Number(formatUnits(usedDailyLimit, 18)) / Number(formatUnits(totalDailyLimit, 18))) * 100, 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-[#64748B]">
                            Used: <span className="text-[#F59E0B] font-bold">{formatUSDT(usedDailyLimit)}</span>
                        </span>
                        <span className="text-[#64748B]">
                            Remaining: <span className="text-[#10B981] font-bold">{formatUSDT(remainingDailyLimit)}</span>
                        </span>
                        <span className="text-[#64748B]">
                            Total: <span className="text-[#EC4899] font-bold">{formatUSDT(totalDailyLimit)}</span>
                        </span>
                    </div>

                    {/* Warning if limit low */}
                    {totalDailyLimit > BigInt(0) && remainingDailyLimit < BigInt('10000000000000000000') && (
                        <div className="mt-3 p-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg">
                            <p className="text-[10px] sm:text-xs text-[#F59E0B] flex items-center gap-1">
                                ⚠️ <span>Daily limit running low! Resets in a few hours.</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Earning Cap Progress Card */}
            {isRegistered && info && balance && (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl">📈</span>
                            <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">Total Earning Cap Progress</h3>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#EC4899]">
                            {info.earningCap > BigInt(0)
                                ? `${((Number(formatUnits(balance.totalEarned, 18)) / Number(formatUnits(info.earningCap, 18))) * 100).toFixed(1)}%`
                                : '0%'
                            }
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 sm:h-4 bg-[#0F172A] rounded-full overflow-hidden mb-2 border border-[#334155]">
                        <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${info.earningCap > BigInt(0) && (Number(formatUnits(balance.totalEarned, 18)) / Number(formatUnits(info.earningCap, 18))) >= 1
                                ? 'bg-gradient-to-r from-[#EF4444] to-[#F59E0B]'
                                : 'bg-gradient-to-r from-[#10B981] to-[#3B82F6]'
                                }`}
                            style={{
                                width: info.earningCap > BigInt(0)
                                    ? `${Math.min((Number(formatUnits(balance.totalEarned, 18)) / Number(formatUnits(info.earningCap, 18))) * 100, 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-[#64748B]">
                            Earned: <span className="text-[#10B981] font-bold">{formatUSDT(balance.totalEarned)}</span>
                        </span>
                        <span className="text-[#64748B]">
                            Cap: <span className="text-[#EC4899] font-bold">{formatUSDT(info.earningCap)}</span>
                        </span>
                    </div>

                    {/* Warning if near cap */}
                    {info.earningCap > BigInt(0) && (Number(formatUnits(balance.totalEarned, 18)) / Number(formatUnits(info.earningCap, 18))) >= 0.9 && (
                        <div className="mt-3 p-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg">
                            <p className="text-[10px] sm:text-xs text-[#F59E0B] flex items-center gap-1">
                                ⚠️ <span>You're near your earning cap! Top up any package to increase the limit.</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Smart Package Card */}
            {isRegistered && (
                <SmartPackageCard />
            )}

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
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Claimable</p>
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
