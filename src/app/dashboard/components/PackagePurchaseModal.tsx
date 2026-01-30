'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { contracts } from '@/config/wagmi';

interface PackagePurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageId: number;
    packageName: string;
    packagePrice: number;
    topUpCount: number;
    actionType: 'start' | 'upgrade' | 'topup' | 'locked';
    usdtBalance: bigint;
    usdtAllowance: bigint;
    onApprove: () => void;
    onPurchase: () => void;
    isApproving: boolean;
    isPurchasing: boolean;
}

export default function PackagePurchaseModal({
    isOpen,
    onClose,
    packageId,
    packageName,
    packagePrice,
    topUpCount,
    actionType,
    usdtBalance,
    usdtAllowance,
    onApprove,
    onPurchase,
    isApproving,
    isPurchasing
}: PackagePurchaseModalProps) {
    const { address } = useAccount();
    const { data: bnbBalance } = useBalance({ address });
    
    const [error, setError] = useState<string>('');
    const [step, setStep] = useState<'check' | 'approve' | 'purchase'>('check');
    const [wasPurchasing, setWasPurchasing] = useState(false);

    const requiredAmount = parseUnits(packagePrice.toString(), 18);
    const hasEnoughUSDT = usdtBalance >= requiredAmount;
    const hasEnoughBNB = bnbBalance ? BigInt(bnbBalance.value) >= parseUnits('0.0001', 18) : false;
    const needsApproval = usdtAllowance < requiredAmount;

    // Reload page when purchase completes
    useEffect(() => {
        if (wasPurchasing && !isPurchasing && !error) {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
        if (isPurchasing) {
            setWasPurchasing(true);
        }
    }, [isPurchasing, wasPurchasing, error]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setStep('check');
            return;
        }

        // Check balances
        if (!hasEnoughBNB) {
            setError('Insufficient BNB for gas fees. Please add at least 0.0001 BNB to your wallet.');
            return;
        }

        if (!hasEnoughUSDT) {
            setError(`Insufficient USDT balance. You need $${packagePrice} USDT but only have $${formatUnits(usdtBalance, 18)} USDT.`);
            return;
        }

        // Determine step
        if (needsApproval) {
            setStep('approve');
        } else {
            setStep('purchase');
        }

        setError('');
    }, [isOpen, hasEnoughBNB, hasEnoughUSDT, needsApproval, packagePrice, usdtBalance]);

    const handleApprove = async () => {
        try {
            setError('');
            await onApprove();
            setStep('purchase');
        } catch (err: any) {
            setError(err?.message || 'Approval failed. Please try again.');
        }
    };

    const handlePurchase = async () => {
        try {
            setError('');
            onPurchase();
            // Page will reload automatically via useEffect when transaction completes
        } catch (err: any) {
            setError(err?.message || 'Purchase failed. Please try again.');
        }
    };

    if (!isOpen) return null;

    const getActionText = () => {
        switch (actionType) {
            case 'start': return 'Start with';
            case 'upgrade': return 'Upgrade to';
            case 'topup': return 'Top-up';
            default: return 'Purchase';
        }
    };

    const getActionEmoji = () => {
        switch (actionType) {
            case 'start': return '✅';
            case 'upgrade': return '⬆️';
            case 'topup': return '🔄';
            default: return '📦';
        }
    };

    const modalContent = (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border-2 border-[#334155] max-w-md w-full p-6 relative z-[10000] my-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{getActionEmoji()}</div>
                    <h2 className="text-xl font-bold text-[#F8FAFC] mb-1">
                        {getActionText()} {packageName}
                    </h2>
                    <p className="text-sm text-[#64748B]">Package {packageId}</p>
                </div>

                {/* Package Details */}
                <div className="bg-[#0F172A] rounded-xl p-4 mb-6 border border-[#334155]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#64748B]">Package Price</span>
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#D946EF]">
                            ${packagePrice.toLocaleString()}
                        </span>
                    </div>
                    
                    {actionType === 'topup' && (
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-[#64748B]">Top-ups Used</span>
                            <span className="text-sm font-bold text-[#F8FAFC]">{topUpCount}/10</span>
                        </div>
                    )}

                    <div className="border-t border-[#334155] pt-3 mt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-[#64748B]">Your USDT Balance</span>
                            <span className={`text-sm font-bold ${hasEnoughUSDT ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                ${parseFloat(formatUnits(usdtBalance, 18)).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#64748B]">Your BNB Balance</span>
                            <span className={`text-sm font-bold ${hasEnoughBNB ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {bnbBalance ? parseFloat(formatUnits(BigInt(bnbBalance.value), 18)).toFixed(4) : '0.0000'} BNB
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-lg p-3 mb-4">
                        <p className="text-sm text-[#EF4444] text-center">⚠️ {error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!error && step === 'approve' && (
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isApproving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Approving...
                                </span>
                            ) : (
                                `🔓 Approve USDT ($${packagePrice})`
                            )}
                        </button>
                    )}

                    {!error && step === 'purchase' && (
                        <button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-[#EC4899] to-[#D946EF] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPurchasing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                `${getActionEmoji()} Confirm ${getActionText()}`
                            )}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        disabled={isApproving || isPurchasing}
                        className="w-full py-3 rounded-lg font-bold text-[#64748B] bg-[#334155] hover:bg-[#475569] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>

                {/* Info */}
                {!error && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-[#64748B]">
                            {step === 'approve' ? '⚡ Step 1 of 2: Approve USDT spending' : '⚡ Step 2 of 2: Confirm purchase'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
