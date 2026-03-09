'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import {
    useWeeklyPoolBalance,
    useTotalWeeklyShares,
    useGetCurrentWeek,
    useDistributeWeeklyPool,
    useLuckyDrawPool,
    useDrawLuckyWinner,
    useGetWeeklyShareholders,
    useUserWeeklyShares,
    useWeekStartTimestamp,
    useWeeklyPoolPerWeek,
    useLuckyDrawPoolPerWeek,
    useWeekDistributed,
    useWeekLuckyDrawn,
    useSetWeeklyPoolGlobalBalance,
    useSetLuckyDrawPoolGlobalBalance,
    useSetWeeklyPoolAmount,
    useSetLuckyDrawPoolAmount
} from '@/hooks/useAdminContracts';
import { useLuckyDrawEntryEvents, useAllLuckyDrawWinners } from '@/hooks/useEvents';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function WeeklyPoolTab() {
    const { data: weeklyBalance, refetch: refetchBalance } = useWeeklyPoolBalance();
    const { data: totalShares, refetch: refetchShares } = useTotalWeeklyShares();
    const { data: currentWeek, refetch: refetchWeek } = useGetCurrentWeek();
    const { data: luckyDrawPoolData, refetch: refetchLuckyDraw } = useLuckyDrawPool();
    const { data: weekStartTimestamp } = useWeekStartTimestamp();

    // Get current week per-week balances
    const currentWeekNum = currentWeek ? BigInt(currentWeek.toString()) : undefined;
    const prevWeekNum = currentWeek && Number(currentWeek) > 0 ? BigInt(Number(currentWeek) - 1) : undefined;
    const { data: currentWeekSharePool } = useWeeklyPoolPerWeek(currentWeekNum);
    const { data: prevWeekSharePool } = useWeeklyPoolPerWeek(prevWeekNum);
    const { data: currentWeekLuckyPool } = useLuckyDrawPoolPerWeek(currentWeekNum);
    const { data: prevWeekLuckyPool } = useLuckyDrawPoolPerWeek(prevWeekNum);

    const [targetWeekInput, setTargetWeekInput] = useState('');
    const [targetWeek, setTargetWeek] = useState<bigint | undefined>(prevWeekNum);
    const [weeklyGlobalInput, setWeeklyGlobalInput] = useState('');
    const [luckyGlobalInput, setLuckyGlobalInput] = useState('');
    const [weeklyWeekInput, setWeeklyWeekInput] = useState('');
    const [luckyWeekInput, setLuckyWeekInput] = useState('');

    const { data: targetWeekSharePool, refetch: refetchTargetWeekSharePool } = useWeeklyPoolPerWeek(targetWeek);
    const { data: targetWeekLuckyPool, refetch: refetchTargetWeekLuckyPool } = useLuckyDrawPoolPerWeek(targetWeek);

    const {
        setWeeklyPoolGlobalBalance,
        isPending: isWeeklyGlobalPending,
        isConfirming: isWeeklyGlobalConfirming,
        isSuccess: isWeeklyGlobalSuccess,
    } = useSetWeeklyPoolGlobalBalance();

    const {
        setLuckyDrawPoolGlobalBalance,
        isPending: isLuckyGlobalPending,
        isConfirming: isLuckyGlobalConfirming,
        isSuccess: isLuckyGlobalSuccess,
    } = useSetLuckyDrawPoolGlobalBalance();

    const {
        setWeeklyPoolAmount,
        isPending: isWeeklyWeekPending,
        isConfirming: isWeeklyWeekConfirming,
        isSuccess: isWeeklyWeekSuccess,
    } = useSetWeeklyPoolAmount();

    const {
        setLuckyDrawPoolAmount,
        isPending: isLuckyWeekPending,
        isConfirming: isLuckyWeekConfirming,
        isSuccess: isLuckyWeekSuccess,
    } = useSetLuckyDrawPoolAmount();

    // Countdown timer state
    const [countdown, setCountdown] = useState('');
    // Can distribute anytime (distributing previous completed week, not current)
    const canDistribute = true;

    // Calculate countdown to CURRENT week end (just for display)
    useEffect(() => {
        if (!weekStartTimestamp) return;

        const weekStart = Number(weekStartTimestamp);
        const weekLength = 7 * 24 * 60 * 60; // 7 days in seconds
        const currentWeekNum = currentWeek ? Number(currentWeek) : 0;
        const weekEndTime = weekStart + (currentWeekNum * weekLength);

        const updateCountdown = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = weekEndTime - now;

            if (remaining <= 0) {
                setCountdown('Current week ended!');
            } else {
                const days = Math.floor(remaining / (24 * 60 * 60));
                const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
                const minutes = Math.floor((remaining % (60 * 60)) / 60);
                const seconds = remaining % 60;
                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [weekStartTimestamp, currentWeek]);

    useEffect(() => {
        if (!targetWeek && prevWeekNum) {
            setTargetWeek(prevWeekNum);
            setTargetWeekInput(prevWeekNum.toString());
        }
    }, [targetWeek, prevWeekNum]);

    useEffect(() => {
        if (isWeeklyGlobalSuccess || isLuckyGlobalSuccess || isWeeklyWeekSuccess || isLuckyWeekSuccess) {
            refetchBalance();
            refetchLuckyDraw();
            refetchTargetWeekSharePool();
            refetchTargetWeekLuckyPool();
        }
    }, [
        isWeeklyGlobalSuccess,
        isLuckyGlobalSuccess,
        isWeeklyWeekSuccess,
        isLuckyWeekSuccess,
        refetchBalance,
        refetchLuckyDraw,
        refetchTargetWeekSharePool,
        refetchTargetWeekLuckyPool,
    ]);

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    const luckyDrawBalance = luckyDrawPoolData ? (luckyDrawPoolData as any)[0] : BigInt(0);

    const refetchAll = () => {
        refetchBalance();
        refetchShares();
        refetchWeek();
        refetchLuckyDraw();
    };

    const isValidAmount = (value: string) => {
        if (value.trim() === '') return false;
        const parsed = Number(value);
        return !Number.isNaN(parsed) && parsed >= 0;
    };

    const handleFetchWeek = () => {
        if (!/^\d+$/.test(targetWeekInput) || targetWeekInput === '0') {
            toast.error('Enter a valid week number (> 0)');
            return;
        }
        setTargetWeek(BigInt(targetWeekInput));
    };

    const handleSetWeeklyGlobal = () => {
        if (!isValidAmount(weeklyGlobalInput)) {
            toast.error('Enter valid share global amount');
            return;
        }
        setWeeklyPoolGlobalBalance(weeklyGlobalInput);
    };

    const handleSetLuckyGlobal = () => {
        if (!isValidAmount(luckyGlobalInput)) {
            toast.error('Enter valid lucky global amount');
            return;
        }
        setLuckyDrawPoolGlobalBalance(luckyGlobalInput);
    };

    const handleSetWeeklyWeek = () => {
        if (!targetWeek) {
            toast.error('Fetch week first');
            return;
        }
        if (!isValidAmount(weeklyWeekInput)) {
            toast.error('Enter valid weekly share amount');
            return;
        }
        setWeeklyPoolAmount(targetWeek, weeklyWeekInput);
    };

    const handleSetLuckyWeek = () => {
        if (!targetWeek) {
            toast.error('Fetch week first');
            return;
        }
        if (!isValidAmount(luckyWeekInput)) {
            toast.error('Enter valid lucky draw amount');
            return;
        }
        setLuckyDrawPoolAmount(targetWeek, luckyWeekInput);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">📅 Weekly Pool & Lucky Draw</h2>
                <p className="text-sm text-[#64748B]">Manage weekly pool, lucky draw and distributions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="glow">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <p className="text-[#64748B] text-xs">Share Pool (Global)</p>
                    </div>
                    <p className="text-2xl font-bold text-[#EC4899] font-mono">{formatUSDT(weeklyBalance as bigint)}</p>
                </Card>
                <Card variant="stat" hover>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎫</span>
                        <p className="text-[#64748B] text-xs">Total Shares</p>
                    </div>
                    <p className="text-2xl font-bold text-[#10B981] font-mono">{totalShares ? Number(totalShares).toLocaleString() : '0'}</p>
                </Card>
                <Card variant="stat" hover>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📅</span>
                        <p className="text-[#64748B] text-xs">Current Week</p>
                    </div>
                    <p className="text-2xl font-bold text-[#3B82F6] font-mono">Week {currentWeek ? Number(currentWeek) : '0'}</p>
                </Card>
                <Card variant="glow">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎰</span>
                        <p className="text-[#64748B] text-xs">Lucky Draw (Global)</p>
                    </div>
                    <p className="text-2xl font-bold text-[#D946EF] font-mono">{formatUSDT(luckyDrawBalance)}</p>
                </Card>
            </div>

            {/* Week Countdown Timer */}
            <div className="rounded-xl p-4 border bg-gradient-to-r from-[#3B82F6]/10 to-[#0F172A] border-[#3B82F6]/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3B82F6]/20">
                            <span className="text-2xl">⏱️</span>
                        </div>
                        <div>
                            <p className="text-xs text-[#64748B] uppercase tracking-wide">Current Week {currentWeek ? Number(currentWeek) : 0} Ends In</p>
                            <p className="text-xl sm:text-2xl font-bold font-mono text-[#3B82F6]">
                                {countdown || 'Loading...'}
                            </p>
                        </div>
                    </div>
                    <span className="px-4 py-2 bg-[#10B981]/20 text-[#10B981] text-sm font-bold rounded-full border border-[#10B981]/30">
                        ✅ Previous week ready to distribute
                    </span>
                </div>
            </div>

            {/* Current Week (Ongoing) & Previous Week (Completed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <WeekCard 
                    week={currentWeek ? BigInt(currentWeek.toString()) : undefined} 
                    label="Current Week (Ongoing)" 
                    status="ongoing"
                    canDistribute={false}
                    poolBalance={currentWeekSharePool as bigint | undefined}
                />
                <WeekCard 
                    week={currentWeek && Number(currentWeek) > 0 ? BigInt(Number(currentWeek) - 1) : undefined}
                    label="Previous Week (Completed)"
                    status="completed"
                    canDistribute={canDistribute}
                    onSuccess={refetchAll}
                    poolBalance={prevWeekSharePool as bigint | undefined}
                />
            </div>

            {/* Lucky Draw - Current & Previous Week */}
            <div>
                <h3 className="text-lg font-bold text-[#F8FAFC] mb-4">🎰 Lucky Draw</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LuckyDrawCard 
                        week={currentWeek ? BigInt(currentWeek.toString()) : undefined}
                        label="Current Week (Ongoing)"
                        status="ongoing"
                        poolBalance={currentWeekLuckyPool as bigint | undefined}
                    />
                    <LuckyDrawCard 
                        week={currentWeek && Number(currentWeek) > 0 ? BigInt(Number(currentWeek) - 1) : undefined}
                        label="Previous Week (Completed)"
                        status="completed"
                        onSuccess={refetchAll}
                        poolBalance={prevWeekLuckyPool as bigint | undefined}
                    />
                </div>
            </div>

            {/* Pool Balance Adjustments */}
            <Card variant="glow">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC]">🛠️ Pool Balance Adjustment</h3>
                        <p className="text-xs text-[#64748B]">Global pools direct adjust karo, weekly pools week input se fetch/update karo</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            refetchAll();
                            refetchTargetWeekSharePool();
                            refetchTargetWeekLuckyPool();
                        }}
                    >
                        ↻ Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#0F172A] rounded-lg border border-[#1E293B]">
                        <p className="text-xs text-[#64748B] mb-2">Global Balances</p>
                        <div className="space-y-1 text-sm">
                            <p className="text-[#F8FAFC]">Share Pool: <span className="font-mono text-[#EC4899]">{formatUSDT(weeklyBalance as bigint)}</span></p>
                            <p className="text-[#F8FAFC]">Lucky Draw: <span className="font-mono text-[#D946EF]">{formatUSDT(luckyDrawBalance)}</span></p>
                        </div>
                    </div>
                    <div className="p-3 bg-[#0F172A] rounded-lg border border-[#1E293B]">
                        <p className="text-xs text-[#64748B] mb-2">Last Week Snapshot (Week {prevWeekNum?.toString() || '0'})</p>
                        <div className="space-y-1 text-sm">
                            <p className="text-[#F8FAFC]">Share Pool: <span className="font-mono text-[#EC4899]">{formatUSDT(prevWeekSharePool as bigint)}</span></p>
                            <p className="text-[#F8FAFC]">Lucky Draw: <span className="font-mono text-[#D946EF]">{formatUSDT(prevWeekLuckyPool as bigint)}</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-3">
                        <p className="text-sm font-semibold text-[#F8FAFC]">Global Pools Adjust</p>
                        <div className="space-y-2">
                            <label className="block text-xs text-[#64748B]">Share Pool Global (USDT)</label>
                            <div className="flex gap-2">
                                <input
                                    value={weeklyGlobalInput}
                                    onChange={(e) => setWeeklyGlobalInput(e.target.value)}
                                    placeholder="e.g. 12500"
                                    className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#EC4899]"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSetWeeklyGlobal}
                                    disabled={isWeeklyGlobalPending || isWeeklyGlobalConfirming}
                                >
                                    {isWeeklyGlobalPending || isWeeklyGlobalConfirming ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs text-[#64748B]">Lucky Draw Global (USDT)</label>
                            <div className="flex gap-2">
                                <input
                                    value={luckyGlobalInput}
                                    onChange={(e) => setLuckyGlobalInput(e.target.value)}
                                    placeholder="e.g. 4500"
                                    className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D946EF]"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSetLuckyGlobal}
                                    disabled={isLuckyGlobalPending || isLuckyGlobalConfirming}
                                >
                                    {isLuckyGlobalPending || isLuckyGlobalConfirming ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-3">
                        <p className="text-sm font-semibold text-[#F8FAFC]">Weekly Pools Adjust</p>
                        <div className="space-y-2">
                            <label className="block text-xs text-[#64748B]">Week Number</label>
                            <div className="flex gap-2">
                                <input
                                    value={targetWeekInput}
                                    onChange={(e) => setTargetWeekInput(e.target.value)}
                                    placeholder="e.g. 12"
                                    className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                                />
                                <Button size="sm" variant="secondary" onClick={handleFetchWeek}>Fetch</Button>
                            </div>
                            <p className="text-xs text-[#64748B]">
                                Selected: Week {targetWeek?.toString() || '-'} | Share: {formatUSDT(targetWeekSharePool as bigint)} | Lucky: {formatUSDT(targetWeekLuckyPool as bigint)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-[#64748B]">Set Share Pool for Selected Week (USDT)</label>
                            <div className="flex gap-2">
                                <input
                                    value={weeklyWeekInput}
                                    onChange={(e) => setWeeklyWeekInput(e.target.value)}
                                    placeholder="e.g. 800"
                                    className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#EC4899]"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSetWeeklyWeek}
                                    disabled={!targetWeek || isWeeklyWeekPending || isWeeklyWeekConfirming}
                                >
                                    {isWeeklyWeekPending || isWeeklyWeekConfirming ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-[#64748B]">Set Lucky Draw for Selected Week (USDT)</label>
                            <div className="flex gap-2">
                                <input
                                    value={luckyWeekInput}
                                    onChange={(e) => setLuckyWeekInput(e.target.value)}
                                    placeholder="e.g. 350"
                                    className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D946EF]"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSetLuckyWeek}
                                    disabled={!targetWeek || isLuckyWeekPending || isLuckyWeekConfirming}
                                >
                                    {isLuckyWeekPending || isLuckyWeekConfirming ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Shareholder Row Component - Shows user ID and their shares
function ShareholderRow({ userId, week }: { userId: bigint; week: bigint | undefined }) {
    const { data: shares } = useUserWeeklyShares(userId, week);
    
    return (
        <div className="flex justify-between items-center text-xs p-2 bg-[#0F172A] rounded">
            <span className="text-[#F8FAFC] font-medium">BULL#{userId.toString()}</span>
            <span className="text-[#10B981] font-mono">
                {shares ? Number(shares).toLocaleString() : '...'} shares
            </span>
        </div>
    );
}

// Week Card - Shows week stats and distribution controls
function WeekCard({ week, label, status, canDistribute, onSuccess, poolBalance }: { 
    week: bigint | undefined; 
    label: string;
    status: 'ongoing' | 'completed';
    canDistribute: boolean;
    onSuccess?: () => void;
    poolBalance?: bigint;
}) {
    const toastShown = useRef(false);
    const [showList, setShowList] = useState(false);

    const { distribute, isPending, isConfirming, isSuccess, error } = useDistributeWeeklyPool();
    const { data: shareholders } = useGetWeeklyShareholders(week);
    const { data: isDistributed } = useWeekDistributed(week);

    const shareholderIds = shareholders ? (shareholders as bigint[]) : [];
    const shareholderCount = shareholderIds.length;
    const alreadyDistributed = isDistributed === true;

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('✅ Distribution complete!');
            if (onSuccess) onSuccess();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Distribution failed');
        }
    }, [isSuccess, error, onSuccess]);

    const handleDistribute = () => {
        if (shareholderCount === 0) {
            toast.error('No shareholders this week');
            return;
        }
        toastShown.current = false;
        distribute();
    };

    const statusColor = status === 'ongoing' ? '#3B82F6' : '#10B981';
    const statusIcon = status === 'ongoing' ? '🟢' : '✅';

    return (
        <Card variant="glow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">{statusIcon} {label}</h3>
                    <p className="text-xs text-[#64748B]">Week #{week?.toString() || '0'}</p>
                </div>
                {status === 'completed' && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDistribute}
                        disabled={isPending || isConfirming || shareholderCount === 0 || !canDistribute || alreadyDistributed}
                    >
                        {alreadyDistributed ? '✅ Distributed' : (isPending || isConfirming ? 'Distributing...' : '💸 Distribute')}
                    </Button>
                )}
            </div>

            {/* Stats Subcards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">💰 Pool</p>
                    <p className="text-lg font-bold text-[#EC4899] font-mono">{formatUSDT(poolBalance)}</p>
                    <p className="text-xs text-[#64748B] mt-1">Week Balance</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">👥 Shareholders</p>
                    <p className="text-lg font-bold text-[#10B981] font-mono">{shareholderCount}</p>
                    <p className="text-xs text-[#64748B] mt-1">Total Users</p>
                </div>
            </div>

            {/* Toggle Shareholders */}
            <button
                onClick={() => setShowList(!showList)}
                className="text-xs text-[#EC4899] hover:underline mb-3"
            >
                {showList ? '▼ Hide Shareholders' : '▶ Show Shareholders'}
            </button>

            {/* Shareholders List */}
            {showList && (
                <div className="mb-4 max-h-48 overflow-y-auto space-y-1">
                    {shareholderCount === 0 ? (
                        <p className="text-xs text-[#64748B]">No shareholders this week</p>
                    ) : (
                        shareholderIds.map((userId, idx) => (
                            <ShareholderRow key={idx} userId={userId} week={week} />
                        ))
                    )}
                </div>
            )}

            {/* Info */}
            <p className="text-xs text-[#64748B]">
                Auto-tracked from sponsor, trading & rank activities
            </p>
        </Card>
    );
}

// Lucky Draw Card - Shows entries for a specific week and draw controls
function LuckyDrawCard({ week, label, status, onSuccess, poolBalance }: { 
    week: bigint | undefined; 
    label: string;
    status: 'ongoing' | 'completed';
    onSuccess?: () => void;
    poolBalance?: bigint;
}) {
    const [showEntries, setShowEntries] = useState(false);
    const toastShown = useRef(false);
    
    const { events: entries, isLoading: entriesLoading, refetch: refetchEntries } = useLuckyDrawEntryEvents(week);
    const { events: winners, isLoading: winnersLoading, refetch: refetchWinners } = useAllLuckyDrawWinners();
    const { drawWinner, isPending, isConfirming, isSuccess, error } = useDrawLuckyWinner();
    const { data: isDrawn } = useWeekLuckyDrawn(week);

    const alreadyDrawn = isDrawn === true;

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('🎉 Lucky winner drawn!');
            if (onSuccess) onSuccess();
            refetchWinners();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Draw failed');
        }
    }, [isSuccess, error, onSuccess, refetchWinners]);

    const handleDrawWinner = () => {
        if (entries.length === 0) {
            toast.error('No participants this week');
            return;
        }
        toastShown.current = false;
        const participantIds = entries.map(e => e.userId);
        drawWinner(participantIds);
    };

    const statusColor = status === 'ongoing' ? '#3B82F6' : '#D946EF';
    const statusIcon = status === 'ongoing' ? '🟢' : '✅';

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    return (
        <Card variant="glow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">{statusIcon} {label}</h3>
                    <p className="text-xs text-[#64748B]">Week #{week?.toString() || '0'}</p>
                </div>
                {status === 'completed' && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDrawWinner}
                        disabled={isPending || isConfirming || entries.length === 0 || alreadyDrawn}
                    >
                        {alreadyDrawn ? '✅ Drawn' : (isPending || isConfirming ? 'Drawing...' : '🎲 Draw Winner')}
                    </Button>
                )}
            </div>

            {/* Stats Subcards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">💰 Prize</p>
                    <p className="text-lg font-bold text-[#D946EF] font-mono">{formatUSDT(poolBalance)}</p>
                    <p className="text-xs text-[#64748B] mt-1">Week Balance</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">🎫 Participants</p>
                    <p className="text-lg font-bold text-[#10B981] font-mono">{entries.length}</p>
                    <p className="text-xs text-[#64748B] mt-1">Total Users</p>
                </div>
            </div>

            {/* Toggle Participants */}
            <button
                onClick={() => { setShowEntries(!showEntries); if (!showEntries) refetchEntries(); }}
                className="text-xs text-[#EC4899] hover:underline mb-3"
            >
                {showEntries ? '▼ Hide Participants' : '▶ Show Participants'}
            </button>

            {/* Participants List */}
            {showEntries && (
                <div className="mb-4 max-h-48 overflow-y-auto space-y-1">
                    {entriesLoading ? (
                        <p className="text-xs text-[#64748B]">Loading...</p>
                    ) : entries.length === 0 ? (
                        <p className="text-xs text-[#64748B]">No entries this week</p>
                    ) : (
                        entries.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-[#0F172A] rounded">
                                <span className="text-[#F8FAFC] font-medium">BULL#{entry.userId.toString()}</span>
                                <span className="text-[#D946EF] font-mono">{entry.entries.toString()} entries</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Past Winners */}
            <div>
                <p className="text-xs text-[#64748B] mb-2">🏆 Recent Winners</p>
                {winnersLoading ? (
                    <p className="text-xs text-[#64748B]">Loading...</p>
                ) : winners.length === 0 ? (
                    <p className="text-xs text-[#64748B]">No winners yet</p>
                ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {winners.slice(0, 5).map((winner, idx) => (
                            <div key={idx} className="flex justify-between text-xs p-2 bg-[#0F172A] rounded">
                                <div>
                                    <span className="text-[#10B981] font-bold">BULL#{winner.userId.toString()}</span>
                                    <span className="text-[#64748B] ml-2">Week {winner.week.toString()}</span>
                                </div>
                                <span className="text-[#F59E0B] font-mono">{formatUSDT(winner.prize)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
