'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserTeamVolume, useUserRankData, useClaimRankEmi, useClaimFastBonus } from '@/hooks/useContracts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

// Rank configuration
const RANK_CONFIGS = [
    { name: 'None', emiAmount: 0, fastBonus: 0, totalEmis: 0, fastBonusDays: 0 },
    { name: 'Calf', emiAmount: 50, fastBonus: 100, totalEmis: 6, fastBonusDays: 30 },
    { name: 'Bull', emiAmount: 100, fastBonus: 200, totalEmis: 6, fastBonusDays: 60 },
    { name: 'Lead Bull', emiAmount: 150, fastBonus: 300, totalEmis: 6, fastBonusDays: 90 },
    { name: 'King Bull', emiAmount: 200, fastBonus: 400, totalEmis: 6, fastBonusDays: 120 },
    { name: 'Titan', emiAmount: 500, fastBonus: 500, totalEmis: 6, fastBonusDays: 120 },
];

const EMI_INTERVAL_DAYS = 15;

interface RankData {
    achieved: boolean;
    achievedAt: bigint;
    emiPaidCount: bigint;
    lastEmiClaimAt: bigint;
    fastBonusClaimed: boolean;
}

interface UserInfo {
    referrerId: bigint;
    packageLevel: bigint;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    activationDate: bigint;
    directReferralsCount: bigint;
}

export function TeamRankTab() {
    const [copied, setCopied] = useState(false);
    const { address } = useAccount();

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: userInfo, isLoading: infoLoading } = useUserInfo(userId as bigint);
    const { data: teamVolume } = useUserTeamVolume(userId as bigint);

    // Rank data hooks
    const { data: calfData, refetch: refetchCalf } = useUserRankData(userId as bigint, 1);
    const { data: bullData, refetch: refetchBull } = useUserRankData(userId as bigint, 2);
    const { data: leadBullData, refetch: refetchLeadBull } = useUserRankData(userId as bigint, 3);
    const { data: kingBullData, refetch: refetchKingBull } = useUserRankData(userId as bigint, 4);
    const { data: titanData, refetch: refetchTitan } = useUserRankData(userId as bigint, 5);

    const rankDataMap: Record<number, RankData | undefined> = {
        1: calfData as RankData | undefined,
        2: bullData as RankData | undefined,
        3: leadBullData as RankData | undefined,
        4: kingBullData as RankData | undefined,
        5: titanData as RankData | undefined,
    };

    const refetchMap: Record<number, () => void> = {
        1: refetchCalf,
        2: refetchBull,
        3: refetchLeadBull,
        4: refetchKingBull,
        5: refetchTitan,
    };

    const { claimEmi, isPending: emiPending } = useClaimRankEmi();
    const { claimFastBonus, isPending: fastBonusPending } = useClaimFastBonus();

    const info = userInfo as UserInfo | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Helpers
    const referralLink = isRegistered
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${userId}`
        : 'Connect wallet to get referral link';

    const copyLink = () => {
        if (!isRegistered) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatVolume = (value: bigint | undefined) => {
        if (!value) return '$0';
        const num = Number(formatUnits(value, 18));
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const directReferrals = info ? Number(info.directReferralsCount) : 0;

    const canClaimEmi = (rankData: RankData | undefined) => {
        if (!rankData?.achieved) return false;
        if (Number(rankData.emiPaidCount) >= 6) return false;
        if (Number(rankData.lastEmiClaimAt) === 0) return true;

        const now = Math.floor(Date.now() / 1000);
        return now >= Number(rankData.lastEmiClaimAt) + EMI_INTERVAL_DAYS * 24 * 60 * 60;
    };

    const canClaimFastBonus = (rankData: RankData | undefined, rankIndex: number) => {
        if (!rankData?.achieved || rankData.fastBonusClaimed || !info?.activationDate) return false;
        const now = Math.floor(Date.now() / 1000);
        const config = RANK_CONFIGS[rankIndex];
        return now <= Number(info.activationDate) + config.fastBonusDays * 24 * 60 * 60;
    };

    const getNextEmiTime = (rankData: RankData | undefined) => {
        if (!rankData?.achieved) return null;
        if (Number(rankData.lastEmiClaimAt) === 0) return 'Now';
        const nextClaimTime = Number(rankData.lastEmiClaimAt) + EMI_INTERVAL_DAYS * 24 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);
        if (now >= nextClaimTime) return 'Now';
        return `${Math.ceil((nextClaimTime - now) / (24 * 60 * 60))}d`;
    };

    if (!isRegistered && !infoLoading) {
        return (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center animate-slide-up">
                <p className="text-5xl mb-4">👥</p>
                <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Build Your Team</h3>
                <p className="text-[#64748B]">Connect your wallet and register to start building your network and earning rank rewards.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Referral Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EC4899]/20 via-[#1E293B] to-[#D946EF]/20 rounded-xl p-4 sm:p-5 border border-[#EC4899]/30 animate-slide-up">
                <div className="absolute top-2 right-4 text-3xl sm:text-4xl opacity-10">👥</div>
                <p className="text-[10px] sm:text-xs text-[#EC4899] font-medium mb-2 uppercase tracking-wider">Your Referral Link</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#F8FAFC] font-mono focus:border-[#EC4899] outline-none"
                    />
                    <button
                        onClick={copyLink}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A]'
                            }`}
                    >
                        {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Direct Referrals', value: directReferrals, icon: '👥', color: 'text-white' },
                    { label: 'Active Team', value: directReferrals, icon: '✅', color: 'text-[#10B981]' },
                    { label: 'Team Volume', value: formatVolume(teamVolume as bigint), icon: '💰', color: 'text-[#EC4899]' },
                    { label: 'My Rank', value: RANK_CONFIGS[Math.min(Number(info?.packageLevel || 0), RANK_CONFIGS.length - 1)]?.name || 'None', icon: '🏆', color: 'text-[#F59E0B]' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1E293B]/50 border border-[#334155] p-3 rounded-xl card-hover">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{stat.icon}</span>
                            <span className="text-[10px] text-[#64748B] uppercase font-bold">{stat.label}</span>
                        </div>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Rank Rewards Section */}
            <div className="pt-4 border-t border-[#334155]">
                <h2 className="text-lg font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg text-lg">🏆</span>
                    Rank Rewards
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {RANK_CONFIGS.slice(1).map((config, idx) => {
                        const rankIndex = idx + 1;
                        const rankData = rankDataMap[rankIndex];
                        const achieved = rankData?.achieved || false;
                        const canEmi = canClaimEmi(rankData);
                        const canFast = canClaimFastBonus(rankData, rankIndex);
                        const nextEmi = getNextEmiTime(rankData);

                        return (
                            <Card key={rankIndex} variant={achieved ? 'glow' : 'default'} className={`p-4 transition-all ${!achieved ? 'opacity-60 saturate-50' : ''}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-[#F8FAFC] flex items-center gap-2">
                                        {config.name}
                                        {achieved && <span className="text-[#10B981]">✓</span>}
                                    </h3>
                                    {!achieved && <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase">Locked</span>}
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-[#0F172A]/80 rounded-lg p-2.5 flex justify-between items-center border border-[#334155]">
                                        <div>
                                            <p className="text-[10px] text-[#64748B] uppercase">Rank EMI</p>
                                            <p className="text-sm font-bold text-[#10B981]">${config.emiAmount} × 6</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={!canEmi || emiPending}
                                            onClick={() => {
                                                claimEmi(rankIndex);
                                                setTimeout(() => refetchMap[rankIndex](), 2000);
                                            }}
                                            className="h-8 text-[10px]"
                                        >
                                            {canEmi ? 'Claim' : nextEmi || 'Wait'}
                                        </Button>
                                    </div>

                                    <div className="bg-[#0F172A]/80 rounded-lg p-2.5 flex justify-between items-center border border-[#334155]">
                                        <div>
                                            <p className="text-[10px] text-[#64748B] uppercase">Fast Bonus</p>
                                            <p className="text-sm font-bold text-[#D946EF]">${config.fastBonus}</p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={!canFast || fastBonusPending || rankData?.fastBonusClaimed}
                                            onClick={() => {
                                                claimFastBonus(rankIndex);
                                                setTimeout(() => refetchMap[rankIndex](), 2000);
                                            }}
                                            className="h-8 text-[10px]"
                                        >
                                            {rankData?.fastBonusClaimed ? 'Claimed' : canFast ? 'Claim' : '---'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
