'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useUserId, useUserInfo, useUserBalance, usePackageTopUpCount, useUSDTAllowance, usePurchasePackage } from '@/hooks/useContracts';
import { useState, useEffect } from 'react';
import { contracts } from '@/config/wagmi';
import { USDTbABI } from '@/abi';

// Package prices in order
const PACKAGE_PRICES = [11, 27.5, 50, 100, 250, 500, 1000, 2500, 5000];
const PACKAGE_NAMES = ['Starter', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Master', 'VIP'];

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

interface UserBalance {
    totalEarned: bigint;
    availableBalance: bigint;
    claimedBalance: bigint;
}

export function SmartPackageCard() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: userInfo } = useUserInfo(userId as bigint);
    const { data: balanceData } = useUserBalance(userId as bigint);
    const { data: allowance, refetch: refetchAllowance } = useUSDTAllowance(address);

    const info = userInfo as UserInfo | undefined;
    const balArr = balanceData as readonly [bigint, bigint, bigint] | undefined;
    const balance = balArr ? {
        totalEarned: balArr[0],
        availableBalance: balArr[1],
        claimedBalance: balArr[2],
    } : undefined;

    const currentPackageLevel = info?.packageLevel ? Number(info.packageLevel) : 0;
    const { data: topUpCountData } = usePackageTopUpCount(
        userId as bigint, 
        currentPackageLevel > 0 ? BigInt(currentPackageLevel) : undefined
    );
    const topUpCount = topUpCountData ? Number(topUpCountData) : 0;

    const [selectedAction, setSelectedAction] = useState<'topup' | 'upgrade' | null>(null);
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

    const { writeContract: approveUSDT, isPending: isApproving, data: approveHash } = useWriteContract();
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    
    const { purchase, isPending: isPurchasing, data: purchaseHash } = usePurchasePackage();
    const { isSuccess: purchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash });

    // Calculate states
    const earningCap = info?.earningCap || BigInt(0);
    const totalEarned = balance?.totalEarned || BigInt(0);
    const capPercentage = earningCap > BigInt(0) 
        ? Number((totalEarned * BigInt(100)) / earningCap) 
        : 0;

    const canTopUp = capPercentage >= 100 && topUpCount < 10 && currentPackageLevel > 0;
    const canUpgrade = currentPackageLevel > 0 && currentPackageLevel < 9;
    const mustUpgrade = capPercentage >= 100 && topUpCount >= 10;

    const currentPrice = currentPackageLevel > 0 ? PACKAGE_PRICES[currentPackageLevel - 1] : 0;
    const nextPackageLevel = currentPackageLevel < 9 ? currentPackageLevel + 1 : currentPackageLevel;
    const nextPrice = PACKAGE_PRICES[nextPackageLevel - 1];

    // Handle approval success
    useEffect(() => {
        if (approveSuccess && isWaitingForApproval && selectedAction) {
            setIsWaitingForApproval(false);
            const packageId = selectedAction === 'topup' ? currentPackageLevel : nextPackageLevel;
            purchase(address!, BigInt(packageId));
        }
    }, [approveSuccess, isWaitingForApproval, selectedAction]);

    // Reset on purchase success
    useEffect(() => {
        if (purchaseSuccess) {
            setSelectedAction(null);
            setIsWaitingForApproval(false);
            refetchAllowance();
        }
    }, [purchaseSuccess]);

    const handleAction = async (action: 'topup' | 'upgrade') => {
        if (!address || !userId) return;
        
        setSelectedAction(action);
        const packageId = action === 'topup' ? currentPackageLevel : nextPackageLevel;
        const price = PACKAGE_PRICES[packageId - 1];
        const priceWithWPS = price * 1.1; // 10% WPS
        const requiredAmount = parseUnits(priceWithWPS.toString(), 18);

        // Check allowance
        const currentAllowance = (allowance as bigint) || BigInt(0);
        if (currentAllowance < requiredAmount) {
            setIsWaitingForApproval(true);
            approveUSDT({
                address: contracts.usdt,
                abi: USDTbABI,
                functionName: 'approve',
                args: [contracts.bullRun, requiredAmount],
            });
        } else {
            purchase(address, BigInt(packageId));
        }
    };

    const formatUSD = (value: number) => `$${value.toLocaleString()}`;

    // Render stars for top-up count
    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 10; i++) {
            stars.push(
                <span key={i} className={i < topUpCount ? 'text-[#F59E0B]' : 'text-[#334155]'}>
                    ⭐
                </span>
            );
        }
        return stars;
    };

    // No package yet
    if (currentPackageLevel === 0) {
        return (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-6 animate-slide-up">
                <div className="text-center">
                    <div className="text-5xl mb-3">📦</div>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">No Active Package</h3>
                    <p className="text-sm text-[#64748B] mb-4">Activate a package to start earning</p>
                    <p className="text-xs text-[#94A3B8]">Visit the registration page to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs text-[#64748B] mb-1">Current Package</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#EC4899]">
                        {formatUSD(currentPrice)} {PACKAGE_NAMES[currentPackageLevel - 1]}
                    </h3>
                </div>
                <div className="text-4xl">📦</div>
            </div>

            {/* Top-up Counter */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#64748B]">Top-ups Used</p>
                    <p className="text-xs font-bold text-[#F8FAFC]">{topUpCount}/10</p>
                </div>
                <div className="flex gap-1">
                    {renderStars()}
                </div>
                {topUpCount >= 10 && (
                    <p className="text-[10px] text-[#EF4444] mt-1">🚫 Top-up limit reached!</p>
                )}
            </div>

            {/* Earning Cap Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#64748B]">Earning Cap Progress</p>
                    <p className="text-xs font-bold text-[#F8FAFC]">{capPercentage}%</p>
                </div>
                <div className="w-full bg-[#0F172A] rounded-full h-3 overflow-hidden border border-[#334155]">
                    <div 
                        className={`h-full transition-all duration-500 ${
                            capPercentage >= 100 
                                ? 'bg-gradient-to-r from-[#EF4444] to-[#F59E0B]' 
                                : 'bg-gradient-to-r from-[#10B981] to-[#3B82F6]'
                        }`}
                        style={{ width: `${Math.min(capPercentage, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <p className="text-[10px] text-[#64748B]">
                        {formatUSD(Number(formatUnits(totalEarned, 18)))}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                        {formatUSD(Number(formatUnits(earningCap, 18)))}
                    </p>
                </div>
                {capPercentage >= 100 && (
                    <p className="text-[10px] text-[#F59E0B] mt-1">⚠️ Earning cap reached!</p>
                )}
            </div>

            {/* Status Message */}
            <div className={`mb-4 p-3 rounded-lg border ${
                mustUpgrade 
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
                    : capPercentage >= 100
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
                        : 'bg-[#10B981]/10 border-[#10B981]/30'
            }`}>
                <p className={`text-xs font-medium ${
                    mustUpgrade 
                        ? 'text-[#EF4444]'
                        : capPercentage >= 100
                            ? 'text-[#F59E0B]'
                            : 'text-[#10B981]'
                }`}>
                    {mustUpgrade 
                        ? '🚫 Must upgrade to continue earning'
                        : capPercentage >= 100
                            ? '⚠️ Cap reached! Top-up or upgrade to continue'
                            : '✅ Earning active'}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                {/* Top-Up Button */}
                <button
                    onClick={() => handleAction('topup')}
                    disabled={!canTopUp || isApproving || isPurchasing}
                    className={`
                        py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95
                        ${canTopUp && !isApproving && !isPurchasing
                            ? 'bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                            : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                        }
                    `}
                >
                    {isApproving && selectedAction === 'topup' ? (
                        '⏳ Approving...'
                    ) : isPurchasing && selectedAction === 'topup' ? (
                        '⏳ Processing...'
                    ) : (
                        <>🔄 Top-Up {formatUSD(currentPrice)}</>
                    )}
                </button>

                {/* Upgrade Button */}
                <button
                    onClick={() => handleAction('upgrade')}
                    disabled={!canUpgrade || isApproving || isPurchasing}
                    className={`
                        py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95
                        ${canUpgrade && !isApproving && !isPurchasing
                            ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                            : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                        }
                    `}
                >
                    {isApproving && selectedAction === 'upgrade' ? (
                        '⏳ Approving...'
                    ) : isPurchasing && selectedAction === 'upgrade' ? (
                        '⏳ Processing...'
                    ) : (
                        <>⬆️ Upgrade {formatUSD(nextPrice)}</>
                    )}
                </button>
            </div>

            {/* Helper Text */}
            <div className="mt-3 text-center">
                <p className="text-[10px] text-[#64748B]">
                    {canTopUp && !mustUpgrade && 'Top-up resets your earning cap • '}
                    {canUpgrade && `Next: ${PACKAGE_NAMES[nextPackageLevel - 1]}`}
                    {mustUpgrade && 'Upgrade required to continue earning'}
                </p>
            </div>
        </div>
    );
}
