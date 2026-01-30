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
    
    const { writeContract: approveUSDT, isPending: isApproving } = useWriteContract();
    const { purchase, isPending: isPurchasing } = usePurchasePackage();

    return (
        <AllPackagesGrid 
            currentPackageLevel={currentPackageLevel}
            userId={userId as bigint}
            address={address}
            allowance={allowance}
            isApproving={isApproving}
            isPurchasing={isPurchasing}
            approveUSDT={approveUSDT}
            purchase={purchase}
        />
    );
}

// All Packages Grid Component
function AllPackagesGrid({ 
    currentPackageLevel, 
    userId,
    address,
    allowance,
    isApproving,
    isPurchasing,
    approveUSDT,
    purchase
}: { 
    currentPackageLevel: number;
    userId: bigint | undefined;
    address: `0x${string}` | undefined;
    allowance: unknown;
    isApproving: boolean;
    isPurchasing: boolean;
    approveUSDT: any;
    purchase: (userAddress: `0x${string}`, packageId: bigint) => void;
}) {
    const packages = PACKAGE_PRICES.map((price, index) => ({
        id: index + 1,
        name: PACKAGE_NAMES[index],
        price: price
    })).reverse(); // Highest to lowest (9 → 1)

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] mb-4">📦 Packages (Highest to Lowest)</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {packages.map((pkg) => (
                    <PackageMiniCard 
                        key={pkg.id}
                        pkg={pkg}
                        currentPackageLevel={currentPackageLevel}
                        userId={userId}
                        address={address}
                        allowance={allowance}
                        isApproving={isApproving}
                        isPurchasing={isPurchasing}
                        approveUSDT={approveUSDT}
                        purchase={purchase}
                    />
                ))}
            </div>
        </div>
    );
}

// Mini Package Card Component
function PackageMiniCard({ 
    pkg, 
    currentPackageLevel,
    userId,
    address,
    allowance,
    isApproving,
    isPurchasing,
    approveUSDT,
    purchase
}: { 
    pkg: { id: number; name: string; price: number };
    currentPackageLevel: number;
    userId: bigint | undefined;
    address: `0x${string}` | undefined;
    allowance: unknown;
    isApproving: boolean;
    isPurchasing: boolean;
    approveUSDT: any;
    purchase: (userAddress: `0x${string}`, packageId: bigint) => void;
}) {
    const { data: topUpCountData } = usePackageTopUpCount(userId as bigint, BigInt(pkg.id));
    const topUpCount = topUpCountData ? Number(topUpCountData) : 0;

    const isCurrent = currentPackageLevel === pkg.id;
    const isNextPackage = pkg.id === currentPackageLevel + 1; // Only next package for upgrade
    const isLower = pkg.id < currentPackageLevel;
    const isFirstPurchase = currentPackageLevel === 0 && pkg.id === 1; // First must be Package 1
    
    // Can topup if: (1) current package OR (2) lower package that was purchased before
    const canTopUp = (isCurrent || (isLower && topUpCount > 0)) && topUpCount < 10;
    const isMaxed = topUpCount >= 10;

    const formatUSD = (value: number) => `$${value.toLocaleString()}`;

    return (
        <div className={`
            relative rounded-lg border p-3
            ${isCurrent ? 'border-[#EC4899] bg-[#EC4899]/10' : 'border-[#334155] bg-[#0F172A]'}
            ${isMaxed ? 'opacity-50' : ''}
            transition-all duration-200
        `}>
            {/* Badge */}
            {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-[#EC4899] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                    ACTIVE
                </div>
            )}
            {isMaxed && !isCurrent && (
                <div className="absolute -top-2 -right-2 bg-[#EF4444] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                    MAX
                </div>
            )}

            {/* Package Info */}
            <div className="text-center mb-2">
                <h4 className="text-[10px] font-bold text-[#F8FAFC] mb-1">{pkg.name}</h4>
                <p className="text-sm font-black text-[#EC4899]">{formatUSD(pkg.price)}</p>
            </div>

            {/* Top-up Stars (compact) */}
            {topUpCount > 0 && (
                <div className="mb-2">
                    <div className="flex justify-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-[10px] ${i < Math.min(topUpCount, 5) ? 'text-[#F59E0B]' : 'text-[#334155]'}`}>
                                ⭐
                            </span>
                        ))}
                    </div>
                    {topUpCount > 5 && (
                        <div className="flex justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i + 5} className={`text-[10px] ${i < (topUpCount - 5) ? 'text-[#F59E0B]' : 'text-[#334155]'}`}>
                                    ⭐
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-[8px] text-center text-[#64748B] mt-1">{topUpCount}/10</p>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={async () => {
                    if (!address || !userId) return;
                    if (isMaxed || (!canTopUp && !isNextPackage && !isFirstPurchase)) return;
                    
                    const priceWithWPS = pkg.price * 1.1; // 10% WPS
                    const requiredAmount = parseUnits(priceWithWPS.toString(), 18);
                    const currentAllowance = (allowance as bigint) || BigInt(0);
                    
                    if (currentAllowance < requiredAmount) {
                        approveUSDT({
                            address: contracts.usdt,
                            abi: USDTbABI,
                            functionName: 'approve',
                            args: [contracts.bullRun, requiredAmount],
                        });
                    } else {
                        purchase(address, BigInt(pkg.id));
                    }
                }}
                disabled={!userId || isMaxed || (!canTopUp && !isNextPackage && !isFirstPurchase) || (isApproving || isPurchasing)}
                className={`
                    w-full py-1.5 rounded text-[9px] font-bold uppercase
                    transition-all duration-200
                    ${canTopUp || isNextPackage || isFirstPurchase
                        ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:scale-105'
                        : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                    }
                `}
            >
                {isMaxed ? '🚫 Max' :
                    isFirstPurchase ? '✅ Start' :
                    canTopUp ? '🔄 Top-Up' :
                    isNextPackage ? '⬆️ Upgrade' :
                    topUpCount === 0 ? '🔒 Locked' :
                    '✓ Done'
                }
            </button>
        </div>
    );
}
