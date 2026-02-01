'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import {
    useWeeklyPoolBalance,
    useTotalWeeklyShares,
    useCurrentWeek,
    useDistributeWeeklyPool,
    useLuckyDrawPool,
    useDrawLuckyWinner,
    useGetWeeklyShareholders
} from '@/hooks/useAdminContracts';
import { useLuckyDrawEntryEvents, useAllLuckyDrawWinners } from '@/hooks/useEvents';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function WeeklyPoolTab() {
    const { data: weeklyBalance, refetch: refetchBalance } = useWeeklyPoolBalance();
    const { data: totalShares, refetch: refetchShares } = useTotalWeeklyShares();
    const { data: currentWeek, refetch: refetchWeek } = useCurrentWeek();
    const { data: luckyDrawPoolData, refetch: refetchLuckyDraw } = useLuckyDrawPool();

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
                        <p className="text-[#64748B] text-xs">Weekly Pool</p>
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
                        <p className="text-[#64748B] text-xs">Lucky Draw Pool</p>
                    </div>
                    <p className="text-2xl font-bold text-[#D946EF] font-mono">{formatUSDT(luckyDrawBalance)}</p>
                </Card>
            </div>

            {/* Share Pool & Lucky Draw - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DistributeCard onSuccess={refetchAll} currentWeek={currentWeek ? BigInt(currentWeek.toString()) : undefined} />
                <LuckyDrawSection currentWeek={currentWeek ? BigInt(currentWeek.toString()) : undefined} onSuccess={refetchAll} />
            </div>
        </div>
    );
}

// Distribute Card (Share Pool)
function DistributeCard({ onSuccess, currentWeek }: { onSuccess: () => void; currentWeek: bigint | undefined }) {
    const toastShown = useRef(false);
    const [showList, setShowList] = useState(false);

    const { distribute, isPending, isConfirming, isSuccess, error } = useDistributeWeeklyPool();
    const { data: shareholders } = useGetWeeklyShareholders(currentWeek);

    const shareholderIds = shareholders ? (shareholders as bigint[]) : [];
    const shareholderCount = shareholderIds.length;

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('✅ Distribution complete!');
            onSuccess();
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

    return (
        <Card variant="glow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">📊 Share Pool</h3>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDistribute}
                    disabled={isPending || isConfirming || shareholderCount === 0}
                >
                    {isPending || isConfirming ? 'Distributing...' : '💸 Distribute'}
                </Button>
            </div>

            {/* Stats Subcards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">📅 Week</p>
                    <p className="text-xl font-bold text-[#3B82F6] font-mono">{currentWeek?.toString() || '0'}</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">👥 Shareholders</p>
                    <p className="text-xl font-bold text-[#10B981] font-mono">{shareholderCount}</p>
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
                            <div key={idx} className="flex justify-between items-center text-xs p-2 bg-[#0F172A] rounded">
                                <span className="text-[#F8FAFC] font-medium">BULL#{userId.toString()}</span>
                                <span className="text-[#10B981] font-mono">Shareholder</span>
                            </div>
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


// Lucky Draw Section
function LuckyDrawSection({ currentWeek, onSuccess }: { currentWeek: bigint | undefined; onSuccess: () => void }) {
    const [showEntries, setShowEntries] = useState(false);
    const toastShown = useRef(false);

    const { events: entries, isLoading: entriesLoading, refetch: refetchEntries } = useLuckyDrawEntryEvents(currentWeek);
    const { events: winners, isLoading: winnersLoading, refetch: refetchWinners } = useAllLuckyDrawWinners();
    const { drawWinner, isPending, isConfirming, isSuccess, error } = useDrawLuckyWinner();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('🎉 Lucky winner drawn!');
            onSuccess();
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

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    return (
        <Card variant="glow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">🎰 Lucky Draw</h3>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDrawWinner}
                    disabled={isPending || isConfirming || entries.length === 0}
                >
                    {isPending || isConfirming ? 'Drawing...' : '🎲 Draw Winner'}
                </Button>
            </div>

            {/* Stats Subcards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">📅 Week</p>
                    <p className="text-xl font-bold text-[#3B82F6] font-mono">{currentWeek?.toString() || '0'}</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[#64748B] text-xs mb-1">🎫 Participants</p>
                    <p className="text-xl font-bold text-[#D946EF] font-mono">{entries.length}</p>
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
