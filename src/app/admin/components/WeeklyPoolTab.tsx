'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import {
    useWeeklyPoolBalance,
    useTotalWeeklyShares,
    useCurrentWeek,
    useAddToWeeklyPool,
    useDistributeWeeklyPool,
    useStartNewWeek,
    useApproveUSDT
} from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function WeeklyPoolTab() {
    const { data: weeklyBalance, refetch: refetchBalance } = useWeeklyPoolBalance();
    const { data: totalShares, refetch: refetchShares } = useTotalWeeklyShares();
    const { data: currentWeek, refetch: refetchWeek } = useCurrentWeek();

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    const refetchAll = () => {
        refetchBalance();
        refetchShares();
        refetchWeek();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">📅 Weekly Pool</h2>
                <p className="text-sm text-[#64748B]">Manage weekly pool and distributions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glow">
                    <p className="text-[#64748B] text-sm mb-2">Weekly Pool Balance</p>
                    <p className="text-3xl font-bold text-[#EC4899] font-mono">{formatUSDT(weeklyBalance as bigint)}</p>
                </Card>
                <Card variant="stat" hover>
                    <p className="text-[#64748B] text-sm mb-2">Total Shares</p>
                    <p className="text-3xl font-bold text-[#10B981] font-mono">{totalShares ? Number(totalShares).toLocaleString() : '0'}</p>
                    <p className="text-xs text-[#64748B] mt-1">Auto-awarded from referrals & ranks</p>
                </Card>
                <Card variant="stat" hover>
                    <p className="text-[#64748B] text-sm mb-2">Current Week</p>
                    <p className="text-3xl font-bold text-[#3B82F6] font-mono">Week {currentWeek ? Number(currentWeek) : '0'}</p>
                </Card>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AddToPoolCard onSuccess={refetchAll} />
                <DistributeCard onSuccess={refetchAll} />
            </div>

            <StartNewWeekCard onSuccess={refetchAll} />
        </div>
    );
}

// Add to Pool Card
function AddToPoolCard({ onSuccess }: { onSuccess: () => void }) {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'approve' | 'add'>('approve');
    const toastShown = useRef(false);

    const { approve, isPending: approvePending, isSuccess: approveSuccess } = useApproveUSDT();
    const { addToWeeklyPool, isPending, isConfirming, isSuccess, error } = useAddToWeeklyPool();

    useEffect(() => {
        if (approveSuccess && step === 'approve') {
            toast.success('USDT Approved!');
            setStep('add');
        }
    }, [approveSuccess, step]);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Added to weekly pool!');
            onSuccess();
            setAmount('');
            setStep('approve');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to add to pool');
        }
    }, [isSuccess, error, onSuccess]);

    const handleApprove = () => {
        if (!amount) return;
        approve(amount);
    };

    const handleAdd = () => {
        if (!amount) return;
        toastShown.current = false;
        addToWeeklyPool(amount);
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">💰 Add to Weekly Pool</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-[#64748B]">Amount (USDT)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full mt-1 px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white focus:border-[#EC4899] outline-none"
                    />
                </div>

                {step === 'approve' ? (
                    <Button
                        variant="secondary"
                        onClick={handleApprove}
                        disabled={approvePending || !amount}
                        className="w-full"
                    >
                        {approvePending ? 'Approving...' : 'Step 1: Approve USDT'}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleAdd}
                        disabled={isPending || isConfirming || !amount}
                        className="w-full"
                    >
                        {isPending ? 'Confirm...' : isConfirming ? 'Adding...' : 'Step 2: Add to Pool'}
                    </Button>
                )}
            </div>
        </Card>
    );
}

// Distribute Card
function DistributeCard({ onSuccess }: { onSuccess: () => void }) {
    const [userIds, setUserIds] = useState('');
    const toastShown = useRef(false);

    const { distribute, isPending, isConfirming, isSuccess, error } = useDistributeWeeklyPool();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Distribution complete!');
            onSuccess();
            setUserIds('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Distribution failed');
        }
    }, [isSuccess, error, onSuccess]);

    const handleDistribute = () => {
        if (!userIds) return;
        toastShown.current = false;
        const ids = userIds.split(',').map(id => BigInt(id.trim()));
        distribute(ids);
    };

    return (
        <Card variant="glow">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">📊 Distribute Weekly Pool</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-[#64748B]">User IDs (comma separated)</label>
                    <input
                        type="text"
                        value={userIds}
                        onChange={(e) => setUserIds(e.target.value)}
                        placeholder="1, 2, 3, 4, 5"
                        className="w-full mt-1 px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white focus:border-[#EC4899] outline-none"
                    />
                    <p className="text-xs text-[#64748B] mt-1">Enter user IDs to distribute to</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleDistribute}
                    disabled={isPending || isConfirming || !userIds}
                    className="w-full"
                >
                    {isPending ? 'Confirm...' : isConfirming ? 'Distributing...' : 'Distribute Pool'}
                </Button>
            </div>
        </Card>
    );
}

// Start New Week Card
function StartNewWeekCard({ onSuccess }: { onSuccess: () => void }) {
    const toastShown = useRef(false);
    const { startNewWeek, isPending, isConfirming, isSuccess, error } = useStartNewWeek();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('New week started!');
            onSuccess();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to start new week');
        }
    }, [isSuccess, error, onSuccess]);

    const handleStartWeek = () => {
        toastShown.current = false;
        startNewWeek();
    };

    return (
        <Card variant="stat" hover>
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">🗓️ Start New Week</h3>
            <p className="text-sm text-[#64748B] mb-4">
                Reset weekly shares and start a new distribution cycle. This will clear all current shares.
            </p>
            <Button
                variant="danger"
                onClick={handleStartWeek}
                disabled={isPending || isConfirming}
                className="w-full"
            >
                {isPending ? 'Confirm...' : isConfirming ? 'Starting...' : 'Start New Week'}
            </Button>
        </Card>
    );
}
