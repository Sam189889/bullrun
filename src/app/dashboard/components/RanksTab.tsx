'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserRankData, useClaimRankEmi, useClaimFastBonus, useAllRankConfigs } from '@/hooks/useContracts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

// Rank enum matching contract
const RANKS = ['NONE', 'CALF', 'BULL', 'LEAD_BULL', 'KING_BULL', 'TITAN'];

// Fallback rank names (configs fetched from contract dynamically)
const RANK_NAMES = ['None', 'Calf', 'Bull', 'Lead Bull', 'King Bull', 'Titan'];

const EMI_INTERVAL_DAYS = 15;

interface RankData {
    achieved: boolean;
    achievedAt: bigint;
    emiPaidCount: bigint;
    lastEmiClaimAt: bigint;
    fastBonusClaimed: boolean;
}

export function RanksTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: userInfo } = useUserInfo(userId as bigint);

    // Get rank data for all ranks (1-5, skipping NONE)
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

    // Claim hooks
    const { claimEmi, isPending: emiPending } = useClaimRankEmi();
    const { claimFastBonus, isPending: fastBonusPending } = useClaimFastBonus();

    // Fetch rank configs from contract dynamically
    const { configs: RANK_CONFIGS, isLoading: configsLoading } = useAllRankConfigs();

    const info = userInfo as { activationDate: bigint } | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    // Check if EMI claim is available
    const canClaimEmi = (rankData: RankData | undefined, rankIndex: number) => {
        if (!rankData?.achieved) return false;
        if (Number(rankData.emiPaidCount) >= 6) return false;

        // First claim is immediate (lastEmiClaimAt = 0)
        if (Number(rankData.lastEmiClaimAt) === 0) return true;

        // Subsequent claims need 15 days gap
        const now = Math.floor(Date.now() / 1000);
        const lastClaim = Number(rankData.lastEmiClaimAt);
        return now >= lastClaim + EMI_INTERVAL_DAYS * 24 * 60 * 60;
    };

    // Check if fast bonus is available
    const canClaimFastBonus = (rankData: RankData | undefined, rankIndex: number) => {
        if (!rankData?.achieved) return false;
        if (rankData.fastBonusClaimed) return false;
        if (!info?.activationDate) return false;

        const now = Math.floor(Date.now() / 1000);
        const activationTime = Number(info.activationDate);
        const config = RANK_CONFIGS[rankIndex];
        return now <= activationTime + config.fastBonusDays * 24 * 60 * 60;
    };

    // Get time until next EMI claim
    const getNextEmiTime = (rankData: RankData | undefined) => {
        if (!rankData?.achieved) return null;
        if (Number(rankData.lastEmiClaimAt) === 0) return 'Now';

        const lastClaim = Number(rankData.lastEmiClaimAt);
        const nextClaimTime = lastClaim + EMI_INTERVAL_DAYS * 24 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);

        if (now >= nextClaimTime) return 'Now';

        const daysLeft = Math.ceil((nextClaimTime - now) / (24 * 60 * 60));
        return `${daysLeft}d`;
    };

    const handleClaimEmi = async (rankIndex: number) => {
        try {
            claimEmi(rankIndex);
            toast.success('EMI claim submitted!');
            setTimeout(() => refetchMap[rankIndex](), 3000);
        } catch (e) {
            toast.error('Claim failed');
        }
    };

    const handleClaimFastBonus = async (rankIndex: number) => {
        try {
            claimFastBonus(rankIndex);
            toast.success('Fast bonus claim submitted!');
            setTimeout(() => refetchMap[rankIndex](), 3000);
        } catch (e) {
            toast.error('Claim failed');
        }
    };

    if (!isRegistered) {
        return (
            <div className="text-center py-12">
                <p className="text-[#64748B]">Connect wallet to view ranks</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#F8FAFC]">🏆 Rank Rewards</h2>

            <div className="grid gap-4">
                {RANK_CONFIGS.slice(1).map((config, idx) => {
                    const rankIndex = idx + 1;
                    const rankData = rankDataMap[rankIndex];
                    const achieved = rankData?.achieved || false;
                    const emiClaimed = Number(rankData?.emiPaidCount || 0);
                    const canEmi = canClaimEmi(rankData, rankIndex);
                    const canFast = canClaimFastBonus(rankData, rankIndex);
                    const nextEmi = getNextEmiTime(rankData);

                    return (
                        <Card key={rankIndex} variant={achieved ? 'glow' : 'default'} className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                                        {config.name}
                                        {achieved && <span className="text-[#10B981]">✓</span>}
                                    </h3>
                                    <p className="text-sm text-[#64748B]">
                                        {achieved ? 'Achieved' : 'Not achieved yet'}
                                    </p>
                                </div>
                            </div>

                            {achieved ? (
                                <div className="space-y-4">
                                    {/* EMI Section */}
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-[#94A3B8]">Rank EMI</span>
                                            <span className="text-sm text-[#10B981]">${config.emiAmount} × 6</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#64748B]">
                                                Claimed: {emiClaimed}/6 | Next: {nextEmi}
                                            </span>
                                            <Button
                                                variant={canEmi ? 'primary' : 'secondary'}
                                                size="sm"
                                                disabled={!canEmi || emiPending}
                                                onClick={() => handleClaimEmi(rankIndex)}
                                            >
                                                {emiPending ? '...' : canEmi ? 'Claim EMI' : emiClaimed >= 6 ? 'Complete' : 'Wait'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Fast Bonus Section */}
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-[#94A3B8]">Fast Bonus</span>
                                            <span className="text-sm text-[#D946EF]">${config.fastBonus}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#64748B]">
                                                {rankData?.fastBonusClaimed ? 'Claimed ✓' : `Within ${config.fastBonusDays} days`}
                                            </span>
                                            <Button
                                                variant={canFast ? 'primary' : 'secondary'}
                                                size="sm"
                                                disabled={!canFast || fastBonusPending || rankData?.fastBonusClaimed}
                                                onClick={() => handleClaimFastBonus(rankIndex)}
                                            >
                                                {fastBonusPending ? '...' : rankData?.fastBonusClaimed ? 'Claimed' : canFast ? 'Claim' : 'Expired'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-[#64748B] text-sm">
                                    Achieve this rank to unlock EMI and Fast Bonus rewards
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
