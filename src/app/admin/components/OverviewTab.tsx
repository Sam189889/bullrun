'use client';

import { formatUnits } from 'viem';
import { usePoolBalance, useWeeklyPoolBalance, useTotalUsers, useCurrentWeek, useTotalWeeklyShares, usePackageIdCounter, useFirstUser, useContractVersion } from '@/hooks/useAdminContracts';
import { Card, StatCard } from '@/components/ui/Card';

export function OverviewTab() {
    // Fetch real data from contracts
    const { data: poolBalance, isLoading: poolLoading } = usePoolBalance();
    const { data: weeklyPoolBalance, isLoading: weeklyLoading } = useWeeklyPoolBalance();
    const { data: totalUsers, isLoading: usersLoading } = useTotalUsers();
    const { data: currentWeek, isLoading: weekLoading } = useCurrentWeek();
    const { data: totalWeeklyShares } = useTotalWeeklyShares();
    const { data: packageCount } = usePackageIdCounter();
    const { data: firstUser } = useFirstUser();
    const { data: version } = useContractVersion();

    // Format values
    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <Card variant="glow" className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 text-5xl opacity-10">🐂</div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-xl md:text-2xl font-bold text-[#F8FAFC] mb-1">
                        Admin <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Dashboard</span>
                    </h1>
                    <p className="text-sm text-[#94A3B8]">Bull Run Platform Management</p>
                    {Boolean(version) && (
                        <p className="text-xs text-[#64748B] mt-2">Contract Version: {String(version)}</p>
                    )}

                </div>
            </Card>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="💰"
                    label="Pool Balance"
                    value={poolLoading ? 'Loading...' : formatUSDT(poolBalance as bigint)}
                />
                <StatCard
                    icon="📅"
                    label="Weekly Pool"
                    value={weeklyLoading ? 'Loading...' : formatUSDT(weeklyPoolBalance as bigint)}
                />
                <StatCard
                    icon="👥"
                    label="Total Users"
                    value={usersLoading ? 'Loading...' : totalUsers ? Number(totalUsers).toLocaleString() : '0'}
                />
                <StatCard
                    icon="🗓️"
                    label="Current Week"
                    value={weekLoading ? 'Loading...' : currentWeek ? `Week ${currentWeek}` : 'Week 0'}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="stat" hover>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-sm mb-1">Weekly Shares</p>
                            <p className="text-2xl font-bold text-[#EC4899] font-mono">
                                {totalWeeklyShares ? Number(totalWeeklyShares).toLocaleString() : '0'}
                            </p>
                        </div>
                        <span className="text-3xl">📊</span>
                    </div>
                </Card>

                <Card variant="stat" hover>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-sm mb-1">Active Packages</p>
                            <p className="text-2xl font-bold text-[#10B981] font-mono">
                                {packageCount ? Number(packageCount) : '0'}
                            </p>
                        </div>
                        <span className="text-3xl">📦</span>
                    </div>
                </Card>

                <Card variant="stat" hover>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-sm mb-1">First User</p>
                            <p className="text-sm font-mono text-[#3B82F6] truncate max-w-[180px]">
                                {firstUser ? `${(firstUser as string).slice(0, 6)}...${(firstUser as string).slice(-4)}` : '-'}
                            </p>
                        </div>
                        <span className="text-3xl">👑</span>
                    </div>
                </Card>
            </div>

            {/* Contract Info */}
            <Card variant="glass">
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">📋 Contract Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
                        <span className="text-[#64748B]">Pool Balance</span>
                        <span className="text-[#10B981] font-mono">{formatUSDT(poolBalance as bigint)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
                        <span className="text-[#64748B]">Weekly Pool</span>
                        <span className="text-[#EC4899] font-mono">{formatUSDT(weeklyPoolBalance as bigint)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
                        <span className="text-[#64748B]">Total Shares</span>
                        <span className="text-[#3B82F6] font-mono">{totalWeeklyShares ? Number(totalWeeklyShares).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
                        <span className="text-[#64748B]">Week Number</span>
                        <span className="text-[#D946EF] font-mono">{currentWeek ? currentWeek.toString() : '0'}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
