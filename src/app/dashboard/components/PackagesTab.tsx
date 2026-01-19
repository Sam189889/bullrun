'use client';

import { useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// Package data - matches contract
const PACKAGES = [
    { id: 1, price: 11, name: 'Starter' },
    { id: 2, price: 25, name: 'Basic' },
    { id: 3, price: 50, name: 'Bronze' },
    { id: 4, price: 100, name: 'Silver' },
    { id: 5, price: 250, name: 'Gold' },
    { id: 6, price: 500, name: 'Platinum' },
    { id: 7, price: 1000, name: 'Diamond' },
    { id: 8, price: 2500, name: 'Crown' },
    { id: 9, price: 5000, name: 'VIP', isVip: true },
];

export function PackagesTab() {
    const { address, isConnected } = useAccount();
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

    // Get user ID
    const { data: userId } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'walletToUserId',
        args: address ? [address] : undefined,
        query: { enabled: !!address }
    });

    // Get user data
    const userIdBigInt = typeof userId === 'bigint' ? userId : undefined;
    const { data: userData, refetch: refetchUser } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'users',
        args: userIdBigInt ? [userIdBigInt] : undefined,
        query: { enabled: !!userIdBigInt && userIdBigInt > BigInt(0) }
    });

    // Get top-up count for current package
    const currentPackageLevel = userData ? Number((userData as any)[1]) : 0;
    const { data: topUpCount } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'packageTopUpCount',
        args: userIdBigInt && currentPackageLevel ? [userIdBigInt, BigInt(currentPackageLevel)] : undefined,
        query: { enabled: !!userIdBigInt && userIdBigInt > BigInt(0) && currentPackageLevel > 0 }
    });

    // Purchase package
    const { writeContract, isPending, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handlePurchase = async (packageId: number) => {
        if (!address) return;

        try {
            writeContract({
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                functionName: 'purchaseNewPackage',
                args: [address, BigInt(packageId)],
            });
            toast.success('Transaction submitted!');
        } catch (error) {
            toast.error('Transaction failed');
        }
    };

    if (isSuccess) {
        refetchUser();
        toast.success('Package purchased successfully!');
    }

    const user = userData as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint] | undefined;
    const currentPackage = PACKAGES.find(p => p.id === currentPackageLevel);
    const remainingTopUps = 10 - Number(topUpCount || 0);

    return (
        <div className="space-y-6 p-4">
            <h2 className="text-xl font-bold text-[#F8FAFC]">📦 My Package</h2>

            {/* Current Package Info */}
            {currentPackage && (
                <Card variant="glow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#64748B]">Current Package</p>
                            <p className="text-2xl font-bold text-[#EC4899]">
                                {currentPackage.name} - ${currentPackage.price}
                            </p>
                            {!currentPackage.isVip && (
                                <p className="text-xs text-[#64748B] mt-1">
                                    Top-ups remaining: <span className="text-[#10B981]">{remainingTopUps}/10</span>
                                </p>
                            )}
                            {currentPackage.isVip && (
                                <p className="text-xs text-[#10B981] mt-1">✨ Unlimited Earnings</p>
                            )}
                        </div>
                        <div className="text-4xl">
                            {currentPackage.isVip ? '👑' : '📦'}
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    icon="💰"
                    label="Total Invested"
                    value={user ? `$${Number(formatUnits(user[2], 18)).toLocaleString()}` : '$0'}
                />
                <StatCard
                    icon="🎯"
                    label="Earning Cap"
                    value={user && user[3] < BigInt(10) ** BigInt(30)
                        ? `$${Number(formatUnits(user[3], 18)).toLocaleString()}`
                        : '∞ Unlimited'}
                />
            </div>

            {/* Upgrade/Top-up Options */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#F8FAFC]">⬆️ Upgrade or Top-up</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PACKAGES.map((pkg) => {
                        const isCurrent = pkg.id === currentPackageLevel;
                        const isLower = pkg.id < currentPackageLevel;
                        const isUpgrade = pkg.id > currentPackageLevel;
                        const canTopUp = isCurrent && remainingTopUps > 0;

                        return (
                            <div
                                key={pkg.id}
                                className={`p-4 rounded-xl border transition-all ${isCurrent
                                    ? 'border-[#EC4899] bg-[#EC4899]/10'
                                    : isLower
                                        ? 'border-[#334155] bg-[#1E293B]/50 opacity-50'
                                        : 'border-[#334155] bg-[#1E293B] hover:border-[#EC4899]/50'
                                    }`}
                            >
                                <div className="text-center">
                                    <p className="text-2xl mb-1">{pkg.isVip ? '👑' : '📦'}</p>
                                    <p className="font-bold text-[#F8FAFC]">{pkg.name}</p>
                                    <p className="text-lg text-[#EC4899] font-bold">${pkg.price}</p>
                                    {pkg.isVip && (
                                        <p className="text-xs text-[#10B981]">No Cap</p>
                                    )}

                                    {isCurrent ? (
                                        <div className="mt-2">
                                            <span className="text-xs bg-[#EC4899]/20 text-[#EC4899] px-2 py-1 rounded">
                                                Current
                                            </span>
                                            {canTopUp && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full mt-2"
                                                    onClick={() => handlePurchase(pkg.id)}
                                                    disabled={isPending || isConfirming}
                                                >
                                                    Top-up
                                                </Button>
                                            )}
                                        </div>
                                    ) : isUpgrade ? (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="w-full mt-2"
                                            onClick={() => handlePurchase(pkg.id)}
                                            disabled={isPending || isConfirming}
                                        >
                                            Upgrade
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info */}
            <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155]">
                <p className="text-sm text-[#64748B]">
                    💡 <strong>Top-up:</strong> Same package max 10 times, resets earning cap only.<br />
                    ⬆️ <strong>Upgrade:</strong> Higher package increases both cap AND trading limit.
                </p>
            </div>
        </div>
    );
}
