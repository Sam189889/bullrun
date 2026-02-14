'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserTeamVolume, useUserRankData, useClaimRankEmi, useClaimFastBonus, useCheckAndAchieveRanks, useDirectReferrals, useAllRankConfigs, useQualifyingVolume } from '@/hooks/useContracts';
import { useLevelCounts } from '@/hooks/useEvents';
import { useLookupUser } from '@/contexts/LookupContext';
import { GiBull } from 'react-icons/gi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';


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
    usernameId: bigint;
}



// Component to fetch and display users at a specific level
function LevelUsers({ userId, targetLevel, currentLevel = 1 }: { userId: bigint; targetLevel: number; currentLevel?: number }) {
    const { data: referrals } = useDirectReferrals(userId);
    const referralsList = referrals as readonly bigint[] | undefined;

    // If we're at target level, show these users
    if (currentLevel === targetLevel) {
        if (!referralsList || referralsList.length === 0) {
            return null; // Return null instead of message, parent will handle empty state
        }

        return (
            <>
                {referralsList.map((refId) => (
                    <NetworkUserCard key={refId.toString()} userId={refId} />
                ))}
            </>
        );
    }

    // If we need to go deeper, recursively fetch from each referral
    if (currentLevel < targetLevel && referralsList && referralsList.length > 0) {
        return (
            <>
                {referralsList.map((refId) => (
                    <LevelUsers
                        key={refId.toString()}
                        userId={refId}
                        targetLevel={targetLevel}
                        currentLevel={currentLevel + 1}
                    />
                ))}
            </>
        );
    }

    return null; // Return null if no path to target level
}

// Network User Card Component (Clean flat display with referrer info)
function NetworkUserCard({ userId }: { userId: bigint }) {
    const { data: userInfo } = useUserInfo(userId);
    const user = userInfo as UserInfo | undefined;

    // Fetch referrer info
    const { data: referrerInfo } = useUserInfo(user?.referrerId as bigint);
    const referrer = referrerInfo as UserInfo | undefined;

    const PACKAGES = ['None', '$11', '$27.5', '$50', '$100', '$250', '$500', '$1000', '$2500', '$5000'];
    const packageName = user?.packageLevel ? PACKAGES[Number(user.packageLevel)] : 'None';
    const isActive = user?.isActive || false;

    return (
        <div className="flex items-center gap-3 p-3 bg-[#1E293B]/50 border border-[#334155] rounded-lg">
            {/* Avatar - Icon instead of numbers */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                <GiBull className="w-6 h-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#F8FAFC] truncate">
                        BULL{user?.usernameId.toString() || '...'}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                    <span className="text-[#EC4899] font-medium">{packageName}</span>
                    <span>•</span>
                    <span>{user?.directReferralsCount.toString() || '0'} referrals</span>
                </div>
                {/* Referrer info */}
                {referrer && referrer.usernameId && (
                    <div className="flex items-center gap-1 text-[10px] text-[#64748B] mt-1">
                        <span>↳ Referred by:</span>
                        <span className="text-[#8B5CF6] font-medium">BULL{referrer.usernameId.toString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Network Node Component (Tree structure - keeping for future use)

export function TeamRankTab() {
    const [activeSubTab, setActiveSubTab] = useState('overview');
    const [selectedLevel, setSelectedLevel] = useState(1);
    const { address } = useAccount();

    // Check if in lookup mode
    const { targetUserId, isLookupMode } = useLookupUser();

    // Fetch user data - use targetUserId in lookup mode
    const { data: walletUserId } = useUserId(address);
    const userId = isLookupMode ? targetUserId : (walletUserId as bigint);

    const { data: userInfo, isLoading: infoLoading } = useUserInfo(userId as bigint);
    const { data: teamVolume } = useUserTeamVolume(userId as bigint);
    const { data: referrals } = useDirectReferrals(userId as bigint);

    // Qualifying volume with 60:40 rule for each rank
    // Rank requirements: Calf=$300, Bull=$2000, LeadBull=$10000, KingBull=$50000, Titan=$100000
    const { data: qualifyingVolCalf } = useQualifyingVolume(userId as bigint, BigInt(300e18));
    const { data: qualifyingVolBull } = useQualifyingVolume(userId as bigint, BigInt(2000e18));
    const { data: qualifyingVolLeadBull } = useQualifyingVolume(userId as bigint, BigInt(10000e18));
    const { data: qualifyingVolKingBull } = useQualifyingVolume(userId as bigint, BigInt(50000e18));
    const { data: qualifyingVolTitan } = useQualifyingVolume(userId as bigint, BigInt(100000e18));


    const qualifyingVolumeMap: Record<number, bigint | undefined> = {
        1: qualifyingVolCalf as bigint | undefined,
        2: qualifyingVolBull as bigint | undefined,
        3: qualifyingVolLeadBull as bigint | undefined,
        4: qualifyingVolKingBull as bigint | undefined,
        5: qualifyingVolTitan as bigint | undefined,
    };

    // Level counts from events (for network tree)
    const { getLevelCount, totalTeam, isLoading: levelCountsLoading } = useLevelCounts(userId as bigint);

    // Rank data hooks
    const { data: calfData, refetch: refetchCalf } = useUserRankData(userId as bigint, 1);
    const { data: bullData, refetch: refetchBull } = useUserRankData(userId as bigint, 2);
    const { data: leadBullData, refetch: refetchLeadBull } = useUserRankData(userId as bigint, 3);
    const { data: kingBullData, refetch: refetchKingBull } = useUserRankData(userId as bigint, 4);
    const { data: titanData, refetch: refetchTitan } = useUserRankData(userId as bigint, 5);

    // Parse array data from contract to RankData object
    // Contract returns: [achieved, achievedAt, emiPaidCount, lastEmiClaimAt, fastBonusClaimed]
    const parseRankData = (data: any): RankData | undefined => {
        if (!data) return undefined;
        // Handle both array and object formats
        if (Array.isArray(data)) {
            return {
                achieved: Boolean(data[0]),
                achievedAt: data[1] as bigint,
                emiPaidCount: data[2] as bigint,
                lastEmiClaimAt: data[3] as bigint,
                fastBonusClaimed: Boolean(data[4]),
            };
        }
        return data as RankData;
    };

    const rankDataMap: Record<number, RankData | undefined> = {
        1: parseRankData(calfData),
        2: parseRankData(bullData),
        3: parseRankData(leadBullData),
        4: parseRankData(kingBullData),
        5: parseRankData(titanData),
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
    const { checkRanks, isPending: rankCheckPending } = useCheckAndAchieveRanks();

    // Fetch rank configs from contract dynamically
    const { configs: RANK_CONFIGS } = useAllRankConfigs();

    const info = userInfo as UserInfo | undefined;
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

    const subTabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'network', label: 'Network Tree', icon: '🌳' },
    ];

    // Helpers
    const formatVolume = (value: bigint | undefined) => {
        if (!value) return '$0';
        const num = Number(formatUnits(value, 18));
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const directReferrals = info ? Number(info.directReferralsCount) : 0;

    // User's package prices for progress calculation
    const PACKAGE_PRICES = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const userPackagePrice = info?.packageLevel ? PACKAGE_PRICES[Number(info.packageLevel)] : 0;

    // Calculate progress percentage (capped at 100%)
    const calcProgress = (current: number, required: number) => required > 0 ? Math.min((current / required) * 100, 100) : 0;

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
            {/* Sub-Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-bold transition-all ${activeSubTab === tab.id
                            ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white shadow-lg'
                            : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Network Levels Tab */}
            {activeSubTab === 'network' && (
                <div className="space-y-2">
                    {/* Total Team Stats */}
                    <div className="bg-gradient-to-r from-[#EC4899]/10 to-[#8B5CF6]/10 border border-[#EC4899]/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#64748B] uppercase">Total Team Members</p>
                                <p className="text-2xl font-bold text-[#F8FAFC]">{totalTeam}</p>
                            </div>
                            <div className="text-4xl opacity-20">🌳</div>
                        </div>
                    </div>

                    {/* Levels accordion */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(lvl => {
                        const levelCount = getLevelCount(lvl);
                        const hasUsers = levelCount > 0;

                        return (
                            <div key={lvl} className={`bg-[#0F172A] border rounded-xl overflow-hidden transition-all ${hasUsers ? 'border-[#334155] hover:border-[#EC4899]/50' : 'border-[#1E293B] opacity-50'}`}>
                                {/* Level header - clickable only if has users */}
                                <button
                                    onClick={() => hasUsers && setSelectedLevel(selectedLevel === lvl ? 0 : lvl)}
                                    disabled={!hasUsers}
                                    className={`w-full p-3 flex items-center justify-between transition-all ${hasUsers ? 'hover:bg-[#1E293B] cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm ${hasUsers ? (selectedLevel === lvl ? 'text-[#EC4899]' : 'text-[#64748B]') : 'text-[#334155]'}`}>
                                            {hasUsers ? (selectedLevel === lvl ? '▼' : '▶') : '○'}
                                        </span>
                                        <h3 className={`text-sm font-bold ${hasUsers ? 'text-[#F8FAFC]' : 'text-[#475569]'}`}>
                                            Level {lvl}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${hasUsers ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#334155]/50 text-[#64748B]'}`}>
                                            {levelCountsLoading ? '...' : hasUsers ? `${levelCount} users` : 'No users'}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${hasUsers ? 'bg-[#EC4899]/20 text-[#EC4899]' : 'bg-[#334155]/30 text-[#475569]'}`}>
                                        L{lvl}
                                    </div>
                                </button>

                                {/* Level content - expanded */}
                                {selectedLevel === lvl && hasUsers && (
                                    <div className="p-4 pt-2 border-t border-[#334155] bg-[#0F172A]/50">
                                        <div className="grid gap-2">
                                            <LevelUsers userId={userId as bigint} targetLevel={lvl} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Overview Tab Content */}
            {activeSubTab === 'overview' && (
                <>
                    {/* Check Ranks Button */}
                    {!isLookupMode && (
                        <div className="mb-4">
                            <Button
                                onClick={() => checkRanks?.()}
                                disabled={rankCheckPending || !isRegistered}
                                className="w-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rankCheckPending ? '⏳ Checking...' : '🔄 Check & Update Ranks'}
                            </Button>
                        </div>
                    )}
                    
                    {/* Team Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(() => {
                            // Calculate highest achieved rank from contract data
                            let highestRank = 0;
                            for (let i = 5; i >= 1; i--) {
                                if (rankDataMap[i]?.achieved) {
                                    highestRank = i;
                                    break;
                                }
                            }
                            const myRankName = RANK_CONFIGS[highestRank]?.name || 'None';

                            return [
                                { label: 'Direct Referrals', value: directReferrals, icon: '👥', color: 'text-white' },
                                { label: 'Active Team', value: directReferrals, icon: '✅', color: 'text-[#10B981]' },
                                { label: 'Team Volume', value: formatVolume(teamVolume as bigint), icon: '💰', color: 'text-[#EC4899]' },
                                { label: 'My Rank', value: myRankName, icon: '🏆', color: 'text-[#F59E0B]' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#1E293B]/50 border border-[#334155] p-3 rounded-xl card-hover">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm">{stat.icon}</span>
                                        <span className="text-[10px] text-[#64748B] uppercase font-bold">{stat.label}</span>
                                    </div>
                                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            ));
                        })()}
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
                                    <Card key={rankIndex} variant={achieved ? 'glow' : 'default'} className={`p-4 transition-all ${!achieved ? 'opacity-70' : ''}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-[#F8FAFC] flex items-center gap-2">
                                                {config.name}
                                                {achieved && <span className="text-[#10B981]">✓</span>}
                                            </h3>
                                            {achieved ? (
                                                <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full uppercase">Achieved</span>
                                            ) : (
                                                <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                                                    {(() => {
                                                        const qualVol = qualifyingVolumeMap[rankIndex];
                                                        const qualVolNum = qualVol ? Number(formatUnits(qualVol, 18)) : 0;
                                                        return Math.round((calcProgress(userPackagePrice, config.selfPackageMin || 0) +
                                                            calcProgress(directReferrals, config.directsRequired || 0) +
                                                            calcProgress(qualVolNum, config.teamTotalRequired || 0)) / 3);
                                                    })()}% Ready
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress Bars - Show for all ranks */}
                                        {!achieved && (
                                            <div className="space-y-2 mb-4 bg-[#0F172A]/50 rounded-lg p-2 border border-[#334155]">
                                                {/* Self Package Progress */}
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-[#64748B]">Self Package</span>
                                                        <span className={userPackagePrice >= (config.selfPackageMin || 0) ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                                                            ${userPackagePrice} / ${config.selfPackageMin || 0}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${userPackagePrice >= (config.selfPackageMin || 0) ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                                                            style={{ width: `${calcProgress(userPackagePrice, config.selfPackageMin || 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Direct Referrals Progress */}
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-[#64748B]">Direct Referrals</span>
                                                        <span className={directReferrals >= (config.directsRequired || 0) ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                                                            {directReferrals} / {config.directsRequired || 0}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${directReferrals >= (config.directsRequired || 0) ? 'bg-[#10B981]' : 'bg-[#EC4899]'}`}
                                                            style={{ width: `${calcProgress(directReferrals, config.directsRequired || 0)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Team Volume Progress (60:40 rule applied) */}
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-[#64748B]">Team Volume (60:40)</span>
                                                        {(() => {
                                                            const qualVol = qualifyingVolumeMap[rankIndex];
                                                            const qualVolNum = qualVol ? Number(formatUnits(qualVol, 18)) : 0;
                                                            const required = config.teamTotalRequired || 0;
                                                            return (
                                                                <span className={qualVolNum >= required ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                                                                    ${qualVolNum.toFixed(0)} / ${required.toLocaleString()}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                                                        {(() => {
                                                            const qualVol = qualifyingVolumeMap[rankIndex];
                                                            const qualVolNum = qualVol ? Number(formatUnits(qualVol, 18)) : 0;
                                                            const required = config.teamTotalRequired || 0;
                                                            return (
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${qualVolNum >= required ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'}`}
                                                                    style={{ width: `${calcProgress(qualVolNum, required)}%` }}
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
                                                        claimEmi(userId as bigint, rankIndex);
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
                </>
            )}
        </div>
    );
}
