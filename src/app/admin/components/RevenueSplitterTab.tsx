'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import {
    useGetAllShareholders,
    usePendingBalance,
    useTotalSharePercent,
    useTotalDistributed,
    useIsConfigured,
    useAddShareholder,
    useRemoveShareholder,
    useBatchAddShareholders,
    useDistribute
} from '@/hooks/useRevenueSplitter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CONTRACTS } from '@/config/constants';

export function RevenueSplitterTab() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">💸 Revenue Splitter</h2>
                <p className="text-sm text-[#64748B]">Manage shareholders and distribute creator revenue</p>
                <p className="text-xs text-[#EC4899] font-mono mt-1">{CONTRACTS.REVENUE_SPLITTER}</p>
            </div>

            {/* Stats */}
            <SplitterStats />

            {/* Shareholders List */}
            <ShareholdersList />

            {/* Add Shareholder */}
            <AddShareholderForm />

            {/* Batch Add */}
            <BatchAddForm />
        </div>
    );
}

// Stats Component
function SplitterStats() {
    const { data: pendingBalance } = usePendingBalance();
    const { data: totalDistributed } = useTotalDistributed();
    const { data: totalSharePercent } = useTotalSharePercent();
    const { data: isConfigured } = useIsConfigured();
    const { distribute, isPending, isConfirming, isSuccess, error } = useDistribute();
    const toastShown = useRef(false);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Funds distributed successfully!');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Distribution failed');
        }
    }, [isSuccess, error]);

    const handleDistribute = () => {
        toastShown.current = false;
        distribute();
    };

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="stat">
                <p className="text-xs text-[#64748B]">Pending Balance</p>
                <p className="text-xl font-bold text-[#10B981]">{formatUSDT(pendingBalance as bigint)}</p>
            </Card>
            <Card variant="stat">
                <p className="text-xs text-[#64748B]">Total Distributed</p>
                <p className="text-xl font-bold text-[#3B82F6]">{formatUSDT(totalDistributed as bigint)}</p>
            </Card>
            <Card variant="stat">
                <p className="text-xs text-[#64748B]">Share Allocation</p>
                <p className="text-xl font-bold text-[#EC4899]">{totalSharePercent?.toString() || '0'}%</p>
                {isConfigured ? (
                    <span className="text-xs text-[#10B981]">✅ Configured</span>
                ) : (
                    <span className="text-xs text-[#EF4444]">⚠️ Not 100%</span>
                )}
            </Card>
            <Card variant="stat">
                <Button
                    variant="primary"
                    onClick={handleDistribute}
                    disabled={isPending || isConfirming || !isConfigured || !pendingBalance || pendingBalance === BigInt(0)}
                    className="w-full"
                >
                    {isPending || isConfirming ? 'Distributing...' : '💸 Distribute Now'}
                </Button>
            </Card>
        </div>
    );
}

// Shareholders List
function ShareholdersList() {
    const { data: shareholdersData, refetch } = useGetAllShareholders();
    const { removeShareholder, isPending, isConfirming, isSuccess, error } = useRemoveShareholder();
    const toastShown = useRef(false);
    const [removingAddress, setRemovingAddress] = useState<string | null>(null);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Shareholder removed!');
            setRemovingAddress(null);
            refetch();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to remove shareholder');
            setRemovingAddress(null);
        }
    }, [isSuccess, error, refetch]);

    const handleRemove = (wallet: string) => {
        toastShown.current = false;
        setRemovingAddress(wallet);
        removeShareholder(wallet as `0x${string}`);
    };

    // Parse shareholders data
    const shareholders: { wallet: string; share: bigint; totalPaid: bigint }[] = [];
    if (shareholdersData) {
        const [wallets, shares, totalPaid] = shareholdersData as [string[], bigint[], bigint[]];
        for (let i = 0; i < wallets.length; i++) {
            shareholders.push({
                wallet: wallets[i],
                share: shares[i],
                totalPaid: totalPaid[i],
            });
        }
    }

    const formatUSDT = (value: bigint) => {
        return `$${Number(formatUnits(value, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">👥 Current Shareholders</h3>

            {shareholders.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">No shareholders configured</p>
            ) : (
                <div className="space-y-2">
                    {shareholders.map((sh, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm text-[#F8FAFC] font-mono truncate">{sh.wallet}</p>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-xs text-[#EC4899]">{sh.share.toString()}% Share</span>
                                    <span className="text-xs text-[#10B981]">Paid: {formatUSDT(sh.totalPaid)}</span>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemove(sh.wallet)}
                                disabled={isPending || isConfirming}
                            >
                                {removingAddress === sh.wallet ? '...' : '✕'}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

// Add Single Shareholder
function AddShareholderForm() {
    const [wallet, setWallet] = useState('');
    const [share, setShare] = useState('');
    const { addShareholder, isPending, isConfirming, isSuccess, error } = useAddShareholder();
    const toastShown = useRef(false);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Shareholder added!');
            setWallet('');
            setShare('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to add shareholder');
        }
    }, [isSuccess, error]);

    const handleAdd = () => {
        if (!wallet || !share) return;
        toastShown.current = false;
        addShareholder(wallet as `0x${string}`, BigInt(share));
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">➕ Add Shareholder</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-[#64748B] block mb-1">Wallet Address</label>
                    <input
                        type="text"
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#64748B] block mb-1">Share Percentage (1-100)</label>
                    <input
                        type="number"
                        value={share}
                        onChange={(e) => setShare(e.target.value)}
                        placeholder="25"
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={isPending || isConfirming || !wallet || !share}
                    className="w-full"
                >
                    {isPending || isConfirming ? 'Adding...' : 'Add Shareholder'}
                </Button>
            </div>
        </Card>
    );
}

// Batch Add Shareholders
function BatchAddForm() {
    const [entries, setEntries] = useState<{ wallet: string; share: string }[]>([
        { wallet: '', share: '' },
        { wallet: '', share: '' },
    ]);
    const { batchAddShareholders, isPending, isConfirming, isSuccess, error } = useBatchAddShareholders();
    const toastShown = useRef(false);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Shareholders configured!');
            setEntries([{ wallet: '', share: '' }, { wallet: '', share: '' }]);
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to configure shareholders');
        }
    }, [isSuccess, error]);

    const updateEntry = (index: number, field: 'wallet' | 'share', value: string) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const addEntry = () => {
        setEntries([...entries, { wallet: '', share: '' }]);
    };

    const removeEntry = (index: number) => {
        if (entries.length <= 1) return;
        setEntries(entries.filter((_, i) => i !== index));
    };

    const totalShare = entries.reduce((sum, e) => sum + (parseInt(e.share) || 0), 0);

    const handleBatchAdd = () => {
        const validEntries = entries.filter(e => e.wallet && e.share);
        if (validEntries.length === 0) return;

        const wallets = validEntries.map(e => e.wallet as `0x${string}`);
        const shares = validEntries.map(e => BigInt(e.share));

        toastShown.current = false;
        batchAddShareholders(wallets, shares);
    };

    return (
        <Card variant="glow">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">🔄 Batch Configure (Replaces All)</h3>
            <p className="text-xs text-[#64748B] mb-4">⚠️ This will replace all existing shareholders. Total must = 100%</p>

            <div className="space-y-3">
                {entries.map((entry, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input
                            type="text"
                            value={entry.wallet}
                            onChange={(e) => updateEntry(idx, 'wallet', e.target.value)}
                            placeholder="0x..."
                            className="flex-1 px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                        />
                        <input
                            type="number"
                            value={entry.share}
                            onChange={(e) => updateEntry(idx, 'share', e.target.value)}
                            placeholder="%"
                            className="w-20 px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                        />
                        <Button variant="danger" size="sm" onClick={() => removeEntry(idx)} disabled={entries.length <= 1}>
                            ✕
                        </Button>
                    </div>
                ))}

                <div className="flex justify-between items-center">
                    <Button variant="secondary" size="sm" onClick={addEntry}>
                        + Add More
                    </Button>
                    <span className={`text-sm font-bold ${totalShare === 100 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        Total: {totalShare}%
                    </span>
                </div>

                <Button
                    variant="primary"
                    onClick={handleBatchAdd}
                    disabled={isPending || isConfirming || totalShare !== 100}
                    className="w-full"
                >
                    {isPending || isConfirming ? 'Configuring...' : '🚀 Configure Shareholders (Total: ' + totalShare + '%)'}
                </Button>
            </div>
        </Card>
    );
}
