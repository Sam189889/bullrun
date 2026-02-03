'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, formatEther } from 'viem';
import { WalletConnect } from '@/components';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePackage, useUserId, useUSDTBalance, useUSDTAllowance, useRegister, useUserExists } from '@/hooks/useContracts';
import { useApproveUSDT } from '@/hooks/useAdminContracts';
import { opBnbMainnet } from '@/config/wagmi';
import toast from 'react-hot-toast';

// Minimum gas required for transactions (0.0003 BNB)
const MIN_GAS_REQUIRED = 0.0003;

// Wrapper with Suspense for useSearchParams
export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>}>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const searchParams = useSearchParams();
    const refParam = searchParams.get('ref');

    const { address, isConnected } = useAccount();
    const [agreed, setAgreed] = useState(false);
    const toastShown = useRef(false);

    // Check if refParam is an address (starts with 0x) or a userId
    const isRefAddress = refParam?.startsWith('0x');
    const hasReferralLink = !!refParam && refParam.trim() !== '';

    // Get referrer's userId from their address (if ref is an address)
    const { data: referrerUserIdFromAddress, isLoading: referrerIdLoading } = useUserId(
        isRefAddress && hasReferralLink ? (refParam as `0x${string}`) : undefined
    );

    // Determine the actual referrer ID to use
    const referrerId = isRefAddress
        ? (typeof referrerUserIdFromAddress === 'bigint' && referrerUserIdFromAddress > BigInt(0) ? String(referrerUserIdFromAddress) : '')
        : (refParam || '');

    // For address-based refs: if loading is done but no userId found, referrer doesn't exist
    const addressRefNotFound = isRefAddress && !referrerIdLoading && (
        !referrerUserIdFromAddress ||
        referrerUserIdFromAddress === BigInt(0) ||
        (typeof referrerUserIdFromAddress === 'bigint' && referrerUserIdFromAddress <= BigInt(0))
    );

    // Check if referrer exists (only if we have a valid referrer ID)
    // For address-based refs, wait for userId to be fetched first
    const shouldCheckExists = referrerId && referrerId !== '0' && (!isRefAddress || !referrerIdLoading);
    const { data: referrerExists, isLoading: referrerExistsLoading } = useUserExists(
        shouldCheckExists ? BigInt(referrerId) : undefined
    );

    // Combined loading state
    const referrerLoading = (isRefAddress && referrerIdLoading) || referrerExistsLoading;

    // Final referrer validity check
    const isReferrerValid = addressRefNotFound ? false : (referrerExists === true);

    // Get first package ($25)
    const { data: packageData, isLoading: pkgLoading } = usePackage(BigInt(1));
    const { data: userId } = useUserId(address);
    const { data: usdtBalance } = useUSDTBalance(address);
    const { data: allowance, refetch: refetchAllowance } = useUSDTAllowance(address);

    // Native balance for gas
    const { data: nativeBalance } = useBalance({ address, chainId: opBnbMainnet.id });

    // Contract write hooks
    const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveConfirmed, error: approveError } = useApproveUSDT();
    const { register, isPending: regPending, isSuccess: regSuccess, error: regError } = useRegister();

    // Parse package data - contract returns array
    const arr = packageData as readonly [bigint, bigint, bigint, bigint, bigint, bigint, boolean] | undefined;
    const pkg = arr ? {
        price: arr[0],
        wps: arr[1],
        tpv: arr[2],
        cap: arr[5],
    } : null;

    const price = pkg ? Number(formatUnits(pkg.price, 18)) : 10;
    const tpv = pkg ? Number(formatUnits(pkg.tpv, 18)) : 11;  // TPV = price + 10%
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);
    const hasEnoughBalance = typeof usdtBalance === 'bigint' && pkg ? usdtBalance >= pkg.tpv : false;
    const hasAllowance = typeof allowance === 'bigint' && pkg ? allowance >= pkg.tpv : false;
    const nativeBalanceValue = nativeBalance ? Number(formatEther(nativeBalance.value)) : 0;
    const hasEnoughGas = nativeBalanceValue >= MIN_GAS_REQUIRED;

    // Refs for one-time triggers
    const approvalHandled = useRef(false);
    const registrationHandled = useRef(false);

    // Handle approval confirmed - trigger registration after confirmation
    useEffect(() => {
        if (approveConfirmed && !approvalHandled.current) {
            approvalHandled.current = true;
            toast.success('USDT approved! Registering...');
            refetchAllowance();
            // Auto-trigger registration after allowance is confirmed
            setTimeout(() => {
                if (address && referrerId) {
                    registrationHandled.current = false;
                    const refId = BigInt(referrerId);
                    register(address, refId, BigInt(1));
                }
            }, 1000);
        }
        if (approveError) {
            toast.error('Approval failed');
            approvalHandled.current = false; // Allow retry
        }
    }, [approveConfirmed, approveError, refetchAllowance, address, referrerId, register]);

    // Handle registration success
    useEffect(() => {
        if (regSuccess && !registrationHandled.current) {
            registrationHandled.current = true;
            toast.success('Registration successful!');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        }
        if (regError) {
            toast.error('Registration failed');
            registrationHandled.current = false; // Allow retry
        }
    }, [regSuccess, regError]);

    // Reset refs when allowance changes (after refetch)
    useEffect(() => {
        if (hasAllowance) {
            approvalHandled.current = true; // Already approved, don't show toast again
        }
    }, [hasAllowance]);

    const handleApproveAndRegister = async () => {
        if (!pkg || !address) return;

        if (!hasAllowance) {
            // Need approval first - approve TPV (Total Package Value)
            approvalHandled.current = false;
            approve(formatUnits(pkg.tpv, 18));
        } else {
            // Already approved, just register
            registrationHandled.current = false;
            const refId = BigInt(referrerId);
            register(address, refId, BigInt(1));
        }
    };

    const handleRegister = () => {
        if (!address || !pkg) return;
        registrationHandled.current = false;
        const refId = BigInt(referrerId || '1');
        register(address, refId, BigInt(1)); // Package 1
    };

    // Already registered - redirect
    if (isRegistered) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <Card variant="glow" className="max-w-md text-center p-8">
                    <p className="text-4xl mb-4">✅</p>
                    <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">Already Registered!</h2>
                    <p className="text-sm text-[#64748B] mb-4">Your User ID: #{userId?.toString()}</p>
                    <Link href="/dashboard">
                        <Button variant="primary">Go to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-64 h-64 bg-[#EC4899]/5 rounded-full blur-3xl float-slow" />
                <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl float-medium" />
            </div>

            <Card variant="glow" className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.3)]">
                        <span className="text-3xl">🐂</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#F8FAFC]">
                        Join <span className="text-[#EC4899]">Bull Run</span>
                    </h1>
                    <p className="text-sm text-[#64748B] mt-2">Start with our entry package</p>
                </div>

                {/* Package Info */}
                <div className="bg-[#0F172A] rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Package Price</span>
                            <span className="text-[#F8FAFC]">${price}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Pool Share (WPS)</span>
                            <span className="text-[#F8FAFC]">${pkg ? Number(formatUnits(pkg.wps, 18)) : 1}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Earning Cap</span>
                            <span className="text-[#10B981]">10x</span>
                        </div>
                    </div>
                    <div className="border-t border-[#334155] pt-3 flex justify-between items-center">
                        <span className="text-sm text-[#94A3B8]">Total Payment</span>
                        <span className="text-2xl font-bold text-[#EC4899]">${tpv}</span>
                    </div>
                </div>

                {/* Connect Wallet or Register */}
                {!isConnected ? (
                    <div className="text-center">
                        <p className="text-sm text-[#64748B] mb-4">Connect wallet to register</p>
                        <WalletConnect />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Balance Display */}
                        <div className="bg-[#0F172A] rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#64748B]">USDT Balance</span>
                                <span className={`font-mono ${hasEnoughBalance ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    ${usdtBalance ? Number(formatUnits(usdtBalance as bigint, 18)).toFixed(2) : '0'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#64748B]">BNB (Gas)</span>
                                <span className={`font-mono ${hasEnoughGas ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    {nativeBalanceValue.toFixed(4)} BNB
                                </span>
                            </div>
                        </div>

                        {/* Referrer Display (readonly) */}
                        <div>
                            <label className="block text-sm text-[#94A3B8] mb-2">Sponsor</label>
                            <div className="flex gap-2">
                                <div className="flex-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] font-mono text-xs overflow-hidden">
                                    {isRefAddress ? (
                                        <div className="break-all">{refParam}</div>
                                    ) : (
                                        <div>User ID: {refParam}</div>
                                    )}
                                </div>
                                {referrerLoading || (isRefAddress && !referrerId) ? (
                                    <span className="px-3 py-3 text-[#64748B] text-sm">⏳</span>
                                ) : referrerExists ? (
                                    <span className="px-3 py-3 text-[#10B981] text-sm" title="Valid sponsor">✓</span>
                                ) : (
                                    <span className="px-3 py-3 text-[#EF4444] text-sm" title="Invalid sponsor">✗</span>
                                )}
                            </div>
                        </div>

                        {/* Switch Wallet */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#64748B]">Wallet:</span>
                            <WalletConnect />
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-[#EC4899]"
                            />
                            <span className="text-xs text-[#94A3B8]">
                                I understand this is a community-led project and agree to the trading rules.
                            </span>
                        </label>

                        {/* Warnings and Action Buttons */}
                        {!hasReferralLink ? (
                            <div className="text-center p-4 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30">
                                <p className="text-sm text-[#EF4444]">🔗 Referral link required</p>
                                <p className="text-xs text-[#64748B] mt-1">You need a valid referral link to register. Ask your sponsor for one.</p>
                            </div>
                        ) : !hasEnoughGas ? (
                            <div className="text-center p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                                <p className="text-sm text-[#F59E0B]">⛽ Insufficient gas</p>
                                <p className="text-xs text-[#64748B] mt-1">You need at least {MIN_GAS_REQUIRED} BNB for transactions</p>
                            </div>
                        ) : !hasEnoughBalance ? (
                            <div className="text-center p-4 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30">
                                <p className="text-sm text-[#EF4444]">💰 Insufficient USDT balance</p>
                                <p className="text-xs text-[#64748B] mt-1">You need ${tpv} USDT to register</p>
                            </div>
                        ) : referrerLoading ? (
                            <div className="text-center p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
                                <p className="text-sm text-[#F59E0B]">⏳ Verifying referral link...</p>
                                <p className="text-xs text-[#64748B] mt-1">Please wait while we verify your sponsor</p>
                            </div>
                        ) : !isReferrerValid ? (
                            <div className="text-center p-4 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30">
                                <p className="text-sm text-[#EF4444]">❌ Invalid Referral Link</p>
                                <p className="text-xs text-[#64748B] mt-1">
                                    {isRefAddress
                                        ? 'This wallet address is not registered. Please get a valid referral link from your sponsor.'
                                        : 'This referral link is invalid. Please contact your sponsor for a valid link.'
                                    }
                                </p>
                            </div>
                        ) : !hasAllowance ? (
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full"
                                onClick={handleApproveAndRegister}
                                disabled={approvePending || approveConfirming || !agreed}
                            >
                                {approvePending ? 'Approving...' : approveConfirming ? 'Confirming...' : `Approve $${tpv} USDT`}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={handleRegister}
                                disabled={regPending || !agreed}
                            >
                                {regPending ? 'Registering...' : `Register Now - $${tpv}`}
                            </Button>
                        )}
                    </div>
                )}

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-[#64748B] hover:text-[#F8FAFC]">
                        ← Back to Home
                    </Link>
                </div>
            </Card>
        </div>
    );
}
