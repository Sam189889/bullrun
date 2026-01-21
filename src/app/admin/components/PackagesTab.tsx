'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import { usePackage } from '@/hooks';
import { usePackageIdCounter, useTogglePackageStatus } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// Package data structure from contract
interface PackageData {
    id: bigint;
    price: bigint;
    wps: bigint;
    tpv: bigint;
    dailyBidLimit: bigint;
    directSponsorPercent: bigint;
    earningCapMultiplier: bigint;
    isActive: boolean;
}

// Single package card component
function PackageCard({
    pkg,
    onToggle,
    isToggling
}: {
    pkg: PackageData;
    onToggle: (pkg: PackageData) => void;
    isToggling: boolean;
}) {
    const price = Number(formatUnits(pkg.price, 18));
    const wps = Number(formatUnits(pkg.wps, 18));
    const tpv = Number(formatUnits(pkg.tpv, 18));
    const dailyBidLimit = Number(formatUnits(pkg.dailyBidLimit, 18));

    return (
        <Card variant={price >= 200 ? 'glow' : 'stat'} hover>
            {/* Price Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-2xl md:text-3xl font-bold text-[#EC4899]">
                    ${price}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${pkg.isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Details */}
            <div className="space-y-2 pt-4 border-t border-[#334155]">
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">WPS</span>
                    <span className="text-[#F8FAFC] font-medium">${wps}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">TPV</span>
                    <span className="text-[#F8FAFC] font-medium">${tpv}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Daily Limit</span>
                    <span className="text-[#F8FAFC] font-medium">${dailyBidLimit}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Sponsor %</span>
                    <span className="text-[#10B981] font-medium">{Number(pkg.directSponsorPercent)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Earning Cap</span>
                    <span className="text-[#3B82F6] font-medium">{Number(pkg.earningCapMultiplier)}x</span>
                </div>
            </div>

            {/* Toggle Button */}
            <div className="mt-4 pt-4 border-t border-[#334155]">
                <Button
                    variant={pkg.isActive ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => onToggle(pkg)}
                    disabled={isToggling}
                    className="w-full"
                >
                    {isToggling ? '...' : pkg.isActive ? '🔴 Disable' : '🟢 Enable'}
                </Button>
            </div>
        </Card>
    );
}

// Fetch single package by ID
function PackageItem({
    packageId,
    onToggle,
    togglingId
}: {
    packageId: number;
    onToggle: (pkg: PackageData) => void;
    togglingId: bigint | null;
}) {
    const { data: packageData, isLoading } = usePackage(BigInt(packageId));

    if (isLoading) {
        return (
            <Card variant="stat">
                <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-[#334155] rounded w-1/2" />
                    <div className="h-4 bg-[#334155] rounded w-full" />
                    <div className="h-4 bg-[#334155] rounded w-3/4" />
                </div>
            </Card>
        );
    }

    if (!packageData) return null;

    // Contract returns array: [price, wps, tpv, dailyBidLimit, directSponsorPercent, earningCapMultiplier, isActive]
    const arr = packageData as readonly [bigint, bigint, bigint, bigint, bigint, bigint, boolean];

    if (!arr || arr.length < 7) return null;

    const pkg: PackageData = {
        id: BigInt(packageId),
        price: arr[0],
        wps: arr[1],
        tpv: arr[2],
        dailyBidLimit: arr[3],
        directSponsorPercent: arr[4],
        earningCapMultiplier: arr[5],
        isActive: arr[6],
    };

    return <PackageCard pkg={pkg} onToggle={onToggle} isToggling={togglingId === pkg.id} />;
}

export function PackagesTab() {
    const { data: packageCount, refetch: refetchCount } = usePackageIdCounter();
    const { togglePackageStatus, isPending, isConfirming, isSuccess, error } = useTogglePackageStatus();
    const [togglingId, setTogglingId] = useState<bigint | null>(null);
    const toastShown = useRef(false);

    const count = packageCount ? Number(packageCount) : 0;

    // Handle toggle success/error
    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Package status updated!');
            setTogglingId(null);
            refetchCount();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to update package');
            setTogglingId(null);
        }
    }, [isSuccess, error, refetchCount]);

    const handleToggle = (pkg: PackageData) => {
        toastShown.current = false;
        setTogglingId(pkg.id);
        togglePackageStatus(pkg.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#F8FAFC]">📦 Packages</h2>
                    <p className="text-sm text-[#64748B]">
                        {count} packages configured • Toggle status only
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <Card variant="stat">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <p className="text-sm text-[#F8FAFC] font-medium">Packages are fixed</p>
                        <p className="text-xs text-[#64748B]">
                            Package values are set during contract initialization and cannot be changed.
                            You can only enable or disable packages.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Packages Grid */}
            {count > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: count }, (_, i) => (
                        <PackageItem
                            key={i + 1}
                            packageId={i + 1}
                            onToggle={handleToggle}
                            togglingId={togglingId}
                        />
                    ))}
                </div>
            ) : (
                <Card variant="stat">
                    <div className="text-center py-8">
                        <p className="text-4xl mb-3">📦</p>
                        <p className="text-[#64748B]">No packages found</p>
                        <p className="text-xs text-[#475569] mt-2">Contract may not be initialized</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
