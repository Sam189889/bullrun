'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserTeamVolume, useUserRankData, useClaimRankEmi, useClaimFastBonus, useDirectReferrals } from '@/hooks/useContracts';
import { useLevelCounts } from '@/hooks/useEvents';
import { GiBull } from 'react-icons/gi';
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
    usernameId: bigint;
}



// Component to show user count with loading state - using events-based calculation
function LevelUserCount({ level, userId, getLevelCount, isLoadingCounts }: {
    level: number;
    userId: bigint | undefined;
    getLevelCount: (level: number) => number;
    isLoadingCounts: boolean;
}) {
    const count = getLevelCount(level);

    if (isLoadingCounts) {
        return (
            <span className="text-xs text-[#64748B]">
                (Loading...)
            </span>
        );
    }

    return (
        <span className="text-xs text-[#64748B]">
            ({count} {count === 1 ? 'user' : 'users'})
        </span>
    );
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
function NetworkNode({
    userId,
    level,
    maxLevel = 30,
    expandedUserId,
    onToggle
}: {
    userId: bigint;
    level: number;
    maxLevel?: number;
    expandedUserId?: bigint;
    onToggle?: (userId: bigint | null) => void;
}) {
    const { data: userInfo } = useUserInfo(userId);
    const { data: referrals } = useDirectReferrals(userId);

    const user = userInfo as UserInfo | undefined;
    const referralsList = referrals as readonly bigint[] | undefined;

    const hasReferrals = user && user.directReferralsCount > BigInt(0);
    const canExpand = hasReferrals && level < maxLevel;
    const isExpanded = expandedUserId === userId;

    const handleToggle = () => {
        if (!canExpand) return;
        onToggle?.(isExpanded ? null : userId);
    };

    // Get package name from parent RANK_CONFIGS or define locally
    const PACKAGES = ['None', '$11', '$27.5', '$50', '$100', '$250', '$500', '$1000', '$2500', '$5000'];
    const packageName = user?.packageLevel ? PACKAGES[Number(user.packageLevel)] : 'None';
    const isActive = user?.isActive || false;
    const totalInvested = user?.totalInvested ? `$${Number(formatUnits(user.totalInvested, 18)).toFixed(0)}` : '$0';

    return (
        <div className="relative">
            {level > 1 && (
                <div className="absolute left-[-20px] top-0 bottom-0 w-[2px] bg-[#334155]" />
            )}

            <div className={`mb-3 ${level === 1 ? '' : 'ml-4 sm:ml-6'}`}>
                <div
                    className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-lg hover:border-[#EC4899] transition-all cursor-pointer shadow-lg w-full sm:min-w-[500px]"
                    onClick={handleToggle}
                >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {canExpand ? (
                            isExpanded ? (
                                <span className="text-lg text-[#EC4899]">▼</span>
                            ) : (
                                <span className="text-lg text-[#64748B]">▶</span>
                            )
                        ) : (
                            <span className="text-[#334155]">●</span>
                        )}
                    </div>

                    <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-white">
                                {user?.usernameId.toString().slice(0, 2) || '??'}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <p className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">
                                    BULL{user?.usernameId.toString() || '...'}
                                </p>
                                <span className={`text-[10px] px-1 py-0.5 rounded flex-shrink-0 ${isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                    {isActive ? '✅' : '❌'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#64748B] mt-0.5 flex-wrap">
                                <span className="whitespace-nowrap">L{level}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-[#EC4899] whitespace-nowrap">{packageName}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="whitespace-nowrap">{user?.directReferralsCount.toString() || '0'} Dir</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-[#10B981] whitespace-nowrap">{totalInvested}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#EC4899]/20 rounded text-[10px] font-bold text-[#EC4899] border border-[#EC4899]/30">
                            L{level}
                        </div>
                    </div>
                </div>

                {isExpanded && referralsList && referralsList.length > 0 && (
                    <div className="relative mt-2 pl-4 border-l-2 border-[#334155]">
                        {referralsList.map((refId) => (
                            <div key={refId.toString()} className="relative">
                                <div className="absolute left-0 top-6 w-4 h-[2px] bg-[#334155]" />
                                <NetworkNode
                                    userId={refId}
                                    level={level + 1}
                                    maxLevel={maxLevel}
                                    expandedUserId={expandedUserId}
                                    onToggle={onToggle}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function TeamRankTab() {
    const [activeSubTab, setActiveSubTab] = useState('overview');
    const [selectedLevel, setSelectedLevel] = useState(1);
    const { address } = useAccount();

    // Fetch user data
    const { data: userId } = useUserId(address);
    const { data: userInfo, isLoading: infoLoading } = useUserInfo(userId as bigint);
    const { data: teamVolume } = useUserTeamVolume(userId as bigint);
    const { data: referrals } = useDirectReferrals(userId as bigint);

    // Level counts from events (for network tree)
    const { getLevelCount, totalTeam, isLoading: levelCountsLoading } = useLevelCounts(userId as bigint);

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
    const referralsList = referrals as readonly bigint[] | undefined;
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
                </>
            )}
        </div>
    );
}
