'use client';

import { useAccount, useWriteContract, useBalance } from 'wagmi';
import { parseUnits } from 'viem';
import { useUserId, useUserInfo, useUserBalance, usePackageTopUpCount, useUSDTAllowance, usePurchasePackage } from '@/hooks/useContracts';
import { useState } from 'react';
import { contracts } from '@/config/wagmi';
import { USDTbABI } from '@/abi';
import PackagePurchaseModal from './PackagePurchaseModal';

// Package base prices (contract values)
const PACKAGE_BASE_PRICES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
// TPV = Base Price + 10% WPS (actual purchase cost)
const PACKAGE_PRICES = PACKAGE_BASE_PRICES.map(price => price * 1.1);
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
    
    const { writeContract: approveUSDT, isPending: isApproving, data: approveHash } = useWriteContract();
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
            approveHash={approveHash}
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
    purchase,
    approveHash
}: { 
    currentPackageLevel: number;
    userId: bigint | undefined;
    address: `0x${string}` | undefined;
    allowance: unknown;
    isApproving: boolean;
    isPurchasing: boolean;
    approveUSDT: any;
    purchase: (userAddress: `0x${string}`, packageId: bigint) => void;
    approveHash?: `0x${string}`;
}) {
    const packages = PACKAGE_PRICES.map((price, index) => ({
        id: index + 1,
        name: PACKAGE_NAMES[index],
        price: price
    })).reverse(); // Highest to lowest (9 → 1)

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] mb-4">📦 Packages (Highest to Lowest)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        approveHash={approveHash}
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
    purchase,
    approveHash
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
    approveHash?: `0x${string}`;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: topUpCountData } = usePackageTopUpCount(userId as bigint, BigInt(pkg.id));
    const { data: usdtBalance } = useBalance({
        address,
        token: contracts.usdt,
    });
    const topUpCount = topUpCountData ? Number(topUpCountData) : 0;

    const isCurrent = currentPackageLevel === pkg.id;
    const isNextPackage = pkg.id === currentPackageLevel + 1; // Only next package for upgrade
    const isLower = pkg.id < currentPackageLevel;
    const isFirstPurchase = currentPackageLevel === 0 && pkg.id === 1; // First must be Package 1
    const isVIP = currentPackageLevel === 9; // VIP users cannot purchase/retopup
    
    // Can topup if: ANY package that was purchased before (topUpCount > 0) and not maxed AND not VIP
    const canTopUp = !isVIP && topUpCount > 0 && topUpCount < 10;
    const isMaxed = topUpCount >= 10;

    const formatUSD = (value: number) => `$${value.toLocaleString()}`;

    return (
        <div className={`
            relative rounded-xl border-2 p-4 sm:p-5
            ${isVIP ? 'border-[#F59E0B] bg-gradient-to-br from-[#F59E0B]/20 to-[#0F172A]' : 
              isCurrent ? 'border-[#EC4899] bg-[#EC4899]/10' : 'border-[#334155] bg-[#0F172A]'}
            ${isMaxed && !isVIP ? 'opacity-60' : ''}
            transition-all duration-300 hover:border-[#EC4899]/50
        `}>
            {/* Badge */}
            {isVIP && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    👑 VIP
                </div>
            )}
            {isCurrent && !isVIP && (
                <div className="absolute -top-3 -right-3 bg-[#EC4899] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ACTIVE
                </div>
            )}
            {isMaxed && !isCurrent && !isVIP && (
                <div className="absolute -top-3 -right-3 bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MAXED
                </div>
            )}

            {/* Package Info */}
            <div className="text-center mb-4">
                <h4 className="text-sm sm:text-base font-bold text-[#F8FAFC] mb-2">{pkg.name}</h4>
                <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#F59E0B]">
                    {formatUSD(pkg.price)}
                </p>
            </div>

            {/* Top-up Counter with Stars (Hide for VIP) */}
            {pkg.id !== 9 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#64748B]">Top-ups Remaining</p>
                        <p className="text-xs font-bold text-[#F8FAFC]">{10 - topUpCount}/10</p>
                    </div>
                    <div className="flex justify-center gap-1 flex-wrap">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <span key={i} className={`text-base ${i < topUpCount ? 'text-[#1E293B] opacity-40' : 'text-[#FBBF24]'}`}>
                                ⭐
                            </span>
                        ))}
                    </div>
                    {topUpCount >= 10 && (
                        <p className="text-xs text-[#EF4444] text-center mt-2">🚫 Top-up limit reached!</p>
                    )}
                </div>
            )}

            {/* VIP Badge for Package 9 */}
            {pkg.id === 9 && (
                <div className="mb-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#EC4899] rounded-lg">
                        <span className="text-2xl">👑</span>
                        <span className="text-sm font-bold text-white">VIP - Unlimited Earning Cap</span>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={() => {
                    if (!address || !userId) return;
                    if (isVIP || isMaxed || (!canTopUp && !isNextPackage && !isFirstPurchase)) return;
                    setIsModalOpen(true);
                }}
                disabled={!userId || isVIP || isMaxed || (!canTopUp && !isNextPackage && !isFirstPurchase)}
                className={`
                    w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide
                    transition-all duration-300 active:scale-95
                    ${canTopUp || isNextPackage || isFirstPurchase
                        ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                        : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                    }
                `}
            >
                {isVIP ? '👑 VIP - Unlimited Cap' :
                    isMaxed ? '🚫 Maxed Out' :
                    isFirstPurchase ? '✅ Start Here' :
                    canTopUp ? '🔄 Top-Up' :
                    isNextPackage ? '⬆️ Upgrade' :
                    topUpCount === 0 ? '🔒 Locked' :
                    '✓ Purchased'
                }
            </button>

            {/* Purchase Modal */}
            <PackagePurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                packageId={pkg.id}
                packageName={pkg.name}
                packagePrice={pkg.price}
                topUpCount={topUpCount}
                actionType={
                    isFirstPurchase ? 'start' :
                    canTopUp ? 'topup' :
                    isNextPackage ? 'upgrade' :
                    'locked'
                }
                usdtBalance={usdtBalance ? BigInt(usdtBalance.value) : BigInt(0)}
                usdtAllowance={(allowance as bigint) || BigInt(0)}
                onApprove={() => {
                    const requiredAmount = parseUnits(pkg.price.toString(), 18);
                    approveUSDT({
                        address: contracts.usdt,
                        abi: USDTbABI,
                        functionName: 'approve',
                        args: [contracts.bullRun, requiredAmount],
                    });
                }}
                onPurchase={() => {
                    if (address) {
                        purchase(address, BigInt(pkg.id));
                    }
                }}
                isApproving={isApproving}
                isPurchasing={isPurchasing}
                approveHash={approveHash}
            />
        </div>
    );
}
