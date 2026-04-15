'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import { useSetCreatorWallet, useApproveUSDT, useCreatorWallet, useAllPoolBalances, useManagePool, PoolType, useSetFirstUser, useFirstUser, useNFTSplitThreshold, useNFTSplitCount, useNFTQueueCount, useNFTAppreciationBps, useCreateNFT, useSetQueueCount, useDistributionPercents, useSetDistributionPercents, useAvailableBuffer, useWithdrawAvailableBuffer } from '@/hooks/useAdminContracts';
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
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { WeekManagement } from './WeekManagement';
import { DaySettings } from './DaySettings';
import { AdminControlsSection } from './AdminControlsSection';
import { CONTRACTS } from '@/config/constants';


export function SettingsTab() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">⚙️ Settings</h2>
                <p className="text-sm text-[#64748B]">Platform configuration and pool management</p>
            </div>

            {/* Week Management */}
            <WeekManagement />

            {/* Day Settings */}
            <DaySettings />

            {/* First User Settings */}
            <FirstUserSettings />

            {/* Creator Wallet */}
            <CreatorWalletSettings />

            {/* Distribution Percentages */}
            <DistributionPercentsSettings />

            {/* Pool Management */}
            <PoolManagement />

            {/* Buffer Withdrawal */}
            <BufferWithdrawal />

            {/* Revenue Splitter */}
            <RevenueSplitterSection />

            {/* Admin Controls */}
            <AdminControlsSection />
        </div>
    );
}

// First User Settings Component
function FirstUserSettings() {
    const [firstUserAddress, setFirstUserAddress] = useState('');
    const toastShown = useRef(false);

    const { data: currentFirstUser } = useFirstUser();
    const { setFirstUser, isPending, isConfirming, isSuccess, error } = useSetFirstUser();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('First user set successfully!');
            setFirstUserAddress('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to set first user');
        }
    }, [isSuccess, error]);

    const handleSetFirstUser = () => {
        if (!firstUserAddress) return;
        toastShown.current = false;
        setFirstUser(firstUserAddress as `0x${string}`);
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">👤 Set First User</h3>
            <p className="text-xs text-[#64748B] mb-4">Root user / company wallet address</p>

            {/* Current First User */}
            {Boolean(currentFirstUser) && currentFirstUser !== '0x0000000000000000000000000000000000000000' && (
                <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg mb-4">
                    <p className="text-xs text-[#10B981] font-bold mb-1">✅ Current First User</p>
                    <p className="text-xs text-[#F8FAFC] font-mono truncate">{String(currentFirstUser)}</p>
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={firstUserAddress}
                    onChange={(e) => setFirstUserAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                />
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSetFirstUser}
                    disabled={isPending || isConfirming || !firstUserAddress}
                >
                    {isPending || isConfirming ? '...' : 'Set'}
                </Button>
            </div>
        </Card>
    );
}

// Creator Wallet Settings Component
function CreatorWalletSettings() {
    const [creatorAddress, setCreatorAddress] = useState('');
    const toastShown = useRef(false);

    const { data: currentCreator } = useCreatorWallet();
    const { setCreatorWallet, isPending, isConfirming, isSuccess, error } = useSetCreatorWallet();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Creator wallet updated!');
            setCreatorAddress('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to update creator wallet');
        }
    }, [isSuccess, error]);

    const handleSubmit = () => {
        if (!creatorAddress) return;
        toastShown.current = false;
        setCreatorWallet(creatorAddress as `0x${string}`);
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">💼 Creator Wallet</h3>

            {/* Current Wallet */}
            {Boolean(currentCreator) && (
                <div className="p-3 bg-[#0F172A] rounded-lg mb-4">
                    <p className="text-xs text-[#64748B] mb-1">Current Creator Wallet</p>
                    <p className="text-sm text-[#10B981] font-mono truncate">{String(currentCreator)}</p>
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="text-sm text-[#F8FAFC] block mb-1">New Creator Wallet</label>
                    <p className="text-xs text-[#64748B] mb-2">Wallet to receive creator commissions</p>
                    <input
                        type="text"
                        value={creatorAddress}
                        onChange={(e) => setCreatorAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>

                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming || !creatorAddress}
                    className="w-full"
                >
                    {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Updating...' : 'Update Creator Wallet'}
                </Button>
            </div>
        </Card>
    );
}

// Distribution Percentages Settings Component
function DistributionPercentsSettings() {
    const percentages = useDistributionPercents();
    const { setDistributionPercents, isPending, isConfirming, isSuccess, error } = useSetDistributionPercents();
    const toastShown = useRef(false);

    const [seller, setSeller] = useState('12.5');
    const [buffer, setBuffer] = useState('37.5');
    const [levelBonus, setLevelBonus] = useState('25');
    const [creator, setCreator] = useState('10');
    const [trip, setTrip] = useState('10');
    const [luckyDraw, setLuckyDraw] = useState('5');

    // Set form values when data loads (convert basis points to percentage)
    useEffect(() => {
        if (percentages.seller !== undefined) setSeller(String(Number(percentages.seller) / 100));
        if (percentages.buffer !== undefined) setBuffer(String(Number(percentages.buffer) / 100));
        if (percentages.levelBonus !== undefined) setLevelBonus(String(Number(percentages.levelBonus) / 100));
        if (percentages.creator !== undefined) setCreator(String(Number(percentages.creator) / 100));
        if (percentages.trip !== undefined) setTrip(String(Number(percentages.trip) / 100));
        if (percentages.luckyDraw !== undefined) setLuckyDraw(String(Number(percentages.luckyDraw) / 100));
    }, [percentages]);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Distribution percentages updated!');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to update percentages');
        }
    }, [isSuccess, error]);

    const handleUpdate = () => {
        const s = parseFloat(seller) || 0;
        const b = parseFloat(buffer) || 0;
        const l = parseFloat(levelBonus) || 0;
        const c = parseFloat(creator) || 0;
        const t = parseFloat(trip) || 0;
        const ld = parseFloat(luckyDraw) || 0;

        const total = s + b + l + c + t + ld;
        if (Math.abs(total - 100) > 0.01) {
            toast.error(`Total must be 100% (currently ${total.toFixed(2)}%)`);
            return;
        }

        // Convert percentages to basis points (multiply by 100)
        const sBps = Math.round(s * 100);
        const bBps = Math.round(b * 100);
        const lBps = Math.round(l * 100);
        const cBps = Math.round(c * 100);
        const tBps = Math.round(t * 100);
        const ldBps = Math.round(ld * 100);

        toastShown.current = false;
        setDistributionPercents(sBps, bBps, lBps, cBps, tBps, ldBps);
    };

    const total = (parseFloat(seller) || 0) + (parseFloat(buffer) || 0) + (parseFloat(levelBonus) || 0) + (parseFloat(creator) || 0) + (parseFloat(trip) || 0) + (parseFloat(luckyDraw) || 0);

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">📊 Distribution Percentages</h3>
            <p className="text-xs text-[#64748B] mb-4">Configure appreciation distribution (must total 100%, supports decimals)</p>

            {/* Current Values from Contract */}
            {percentages.seller !== undefined ? (
                <div className="p-3 bg-[#1E293B] border border-[#334155] rounded-lg mb-4">
                    <p className="text-xs text-[#64748B] font-bold mb-2">📋 Current Contract Values</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span className="text-[#64748B]">Seller:</span>
                            <span className="text-[#10B981] font-bold ml-1">{(Number(percentages.seller ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#64748B]">Buffer:</span>
                            <span className="text-[#3B82F6] font-bold ml-1">{(Number(percentages.buffer ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#64748B]">Level:</span>
                            <span className="text-[#EC4899] font-bold ml-1">{(Number(percentages.levelBonus ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#64748B]">Creator:</span>
                            <span className="text-[#8B5CF6] font-bold ml-1">{(Number(percentages.creator ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#64748B]">Trip:</span>
                            <span className="text-[#F59E0B] font-bold ml-1">{(Number(percentages.trip ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#64748B]">Lucky:</span>
                            <span className="text-[#EF4444] font-bold ml-1">{(Number(percentages.luckyDraw ?? 0) / 100).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Current Total */}
            <div className={`p-3 rounded-lg mb-4 ${Math.abs(total - 100) < 0.01 ? 'bg-[#10B981]/10 border border-[#10B981]/30' : 'bg-[#EF4444]/10 border border-[#EF4444]/30'}`}>
                <p className={`text-xs font-bold ${Math.abs(total - 100) < 0.01 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    New Total: {total.toFixed(2)}% {Math.abs(total - 100) < 0.01 ? '✓' : '✗ Must be 100%'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Seller %</label>
                    <input
                        type="number"
                        value={seller}
                        onChange={(e) => setSeller(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Buffer %</label>
                    <input
                        type="number"
                        value={buffer}
                        onChange={(e) => setBuffer(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Level Bonus %</label>
                    <input
                        type="number"
                        value={levelBonus}
                        onChange={(e) => setLevelBonus(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Creator %</label>
                    <input
                        type="number"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Trip Pool %</label>
                    <input
                        type="number"
                        value={trip}
                        onChange={(e) => setTrip(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Lucky Draw %</label>
                    <input
                        type="number"
                        value={luckyDraw}
                        onChange={(e) => setLuckyDraw(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>
            </div>

            <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={isPending || isConfirming || total !== 100}
                className="w-full"
            >
                {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Updating...' : 'Update Distribution Percentages'}
            </Button>
        </Card>
    );
}

// Unified Pool Management Component
function PoolManagement() {
    const poolBalances = useAllPoolBalances();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState<PoolType>(PoolType.WEEKLY_POOL);

    const pools = [
        { type: PoolType.WEEKLY_POOL, name: 'Weekly Share Pool', icon: '📅', color: '#3B82F6', balance: poolBalances.weekly },
        { type: PoolType.LUCKY_DRAW_POOL, name: 'Lucky Draw Pool', icon: '🎰', color: '#D946EF', balance: poolBalances.luckyDraw },
        { type: PoolType.RANK_EMI_POOL, name: 'Rank EMI Pool', icon: '💎', color: '#10B981', balance: poolBalances.rankEmi },
        { type: PoolType.TRIP_POOL, name: 'Trip Pool', icon: '✈️', color: '#F59E0B', balance: poolBalances.trip },
        { type: PoolType.BUYSELL_POOL, name: 'BuySell Pool', icon: '🛒', color: '#EC4899', balance: poolBalances.buysell },
        { type: PoolType.BUFFER_POOL, name: 'Buffer Pool', icon: '🏦', color: '#6366F1', balance: poolBalances.buffer },
    ];

    const formatBalance = (balance: bigint | undefined) => {
        if (!balance) return '$0';
        return `$${Number(formatUnits(balance, 18)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    const totalBalance = pools.reduce((sum, pool) => sum + (pool.balance || BigInt(0)), BigInt(0));

    const openDeposit = (pool: PoolType) => {
        setSelectedPool(pool);
        setShowDepositModal(true);
    };

    const openWithdraw = (pool: PoolType) => {
        setSelectedPool(pool);
        setShowWithdrawModal(true);
    };

    return (
        <Card variant="glow">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">💰 Pool Management</h3>
                    <p className="text-xs text-[#64748B]">All platform pools and balances</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[#64748B]">Total Balance</p>
                    <p className="text-lg font-bold text-[#10B981]">{formatBalance(totalBalance)}</p>
                </div>
            </div>

            {/* Pool Grid */}
            <div className="grid grid-cols-1 gap-3">
                {pools.map((pool) => (
                    <div
                        key={pool.type}
                        className="p-3 bg-[#0F172A] rounded-lg flex items-center justify-between"
                        style={{ borderLeft: `3px solid ${pool.color}` }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{pool.icon}</span>
                            <div>
                                <p className="text-sm text-[#F8FAFC] font-medium">{pool.name}</p>
                                <p className="text-lg font-bold font-mono" style={{ color: pool.color }}>
                                    {formatBalance(pool.balance)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openDeposit(pool.type)}
                            >
                                +
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => openWithdraw(pool.type)}
                            >
                                −
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <UnifiedDepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                poolType={selectedPool}
                onSuccess={poolBalances.refetch}
            />
            <UnifiedWithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                poolType={selectedPool}
                onSuccess={poolBalances.refetch}
            />
        </Card>
    );
}

// Pool Names Map
const poolNames: Record<PoolType, string> = {
    [PoolType.WEEKLY_POOL]: 'Weekly Share Pool',
    [PoolType.LUCKY_DRAW_POOL]: 'Lucky Draw Pool',
    [PoolType.RANK_EMI_POOL]: 'Rank EMI Pool',
    [PoolType.TRIP_POOL]: 'Trip Pool',
    [PoolType.BUYSELL_POOL]: 'BuySell Pool',
    [PoolType.BUFFER_POOL]: 'Buffer Pool',
};

// Unified Deposit Modal
function UnifiedDepositModal({ isOpen, onClose, poolType, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    poolType: PoolType;
    onSuccess: () => void;
}) {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'approve' | 'deposit'>('approve');
    const toastShown = useRef(false);

    const { approveForMain, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess, error: approveError } = useApproveUSDT();
    const { managePool, isPending: depositPending, isConfirming: depositConfirming, isSuccess: depositSuccess, error: depositError } = useManagePool();

    useEffect(() => {
        if (approveSuccess && step === 'approve') {
            toast.success('USDT Approved!');
            setStep('deposit');
        }
        if (approveError && !toastShown.current) {
            toastShown.current = true;
            toast.error('Approval failed');
        }
    }, [approveSuccess, approveError, step]);

    useEffect(() => {
        if (depositSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Deposit successful!');
            onClose();
            setAmount('');
            setStep('approve');
            onSuccess();
        }
        if (depositError && !toastShown.current) {
            toastShown.current = true;
            toast.error('Deposit failed');
        }
    }, [depositSuccess, depositError, onClose, onSuccess]);

    useEffect(() => {
        if (isOpen) {
            toastShown.current = false;
            setStep('approve');
            setAmount('');
        }
    }, [isOpen]);

    const handleApprove = () => {
        if (!amount) return;
        toastShown.current = false;
        approveForMain(amount);
    };

    const handleDeposit = () => {
        if (!amount) return;
        toastShown.current = false;
        managePool(poolType, amount, false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Deposit to ${poolNames[poolType]}`} size="sm">
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-[#64748B]">Amount (USDT)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full mt-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white focus:border-[#EC4899] outline-none"
                    />
                </div>

                {step === 'approve' ? (
                    <Button
                        variant="secondary"
                        onClick={handleApprove}
                        disabled={approvePending || approveConfirming || !amount}
                        className="w-full"
                    >
                        {approvePending ? 'Confirm...' : approveConfirming ? 'Approving...' : 'Step 1: Approve USDT'}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleDeposit}
                        disabled={depositPending || depositConfirming || !amount}
                        className="w-full"
                    >
                        {depositPending ? 'Confirm...' : depositConfirming ? 'Depositing...' : 'Step 2: Deposit'}
                    </Button>
                )}
            </div>
        </Modal>
    );
}

// Unified Withdraw Modal
function UnifiedWithdrawModal({ isOpen, onClose, poolType, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    poolType: PoolType;
    onSuccess: () => void;
}) {
    const [amount, setAmount] = useState('');
    const [toAddress, setToAddress] = useState('');
    const toastShown = useRef(false);

    const { managePool, isPending, isConfirming, isSuccess, error } = useManagePool();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Withdrawal successful!');
            onClose();
            setAmount('');
            setToAddress('');
            onSuccess();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Withdrawal failed');
        }
    }, [isSuccess, error, onClose, onSuccess]);

    useEffect(() => {
        if (isOpen) {
            toastShown.current = false;
            setAmount('');
            setToAddress('');
        }
    }, [isOpen]);

    const handleWithdraw = () => {
        if (!amount || !toAddress) {
            toast.error('Enter amount and address');
            return;
        }
        toastShown.current = false;
        managePool(poolType, amount, true, toAddress as `0x${string}`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Withdraw from ${poolNames[poolType]}`} size="sm">
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-[#64748B]">To Address</label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full mt-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white font-mono focus:border-[#EC4899] outline-none"
                    />
                </div>

                <div>
                    <label className="text-sm text-[#64748B]">Amount (USDT)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full mt-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white focus:border-[#EC4899] outline-none"
                    />
                </div>

                <Button
                    variant="danger"
                    onClick={handleWithdraw}
                    disabled={isPending || isConfirming || !amount || !toAddress}
                    className="w-full"
                >
                    {isPending ? 'Confirm...' : isConfirming ? 'Withdrawing...' : 'Withdraw'}
                </Button>
            </div>
        </Modal>
    );
}

// Buffer Withdrawal Component
function BufferWithdrawal() {
    const { data: availableBuffer, refetch } = useAvailableBuffer();
    const { withdrawAvailableBuffer, isPending, isConfirming, isSuccess, error } = useWithdrawAvailableBuffer();
    const toastShown = useRef(false);

    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Buffer withdrawal successful!');
            setAmount('');
            setRecipient('');
            refetch();
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Buffer withdrawal failed');
        }
    }, [isSuccess, error, refetch]);

    const handleWithdraw = () => {
        if (!amount || !recipient) {
            toast.error('Enter amount and recipient address');
            return;
        }
        toastShown.current = false;
        withdrawAvailableBuffer(recipient as `0x${string}`, amount);
    };

    const availableBalanceUSD = availableBuffer ? Number(formatUnits(availableBuffer as bigint, 18)) : 0;

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">🏦 Buffer Withdrawal</h3>
            <p className="text-xs text-[#64748B] mb-4">Withdraw unallocated contract funds</p>

            {/* Available Buffer */}
            <div className="p-3 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-lg mb-4">
                <p className="text-xs text-[#94A3B8] mb-1">Available Buffer</p>
                <p className="text-lg font-bold text-[#6366F1]">${availableBalanceUSD.toFixed(2)}</p>
                <p className="text-xs text-[#64748B] mt-1">= Total Contract Balance - All Pool Balances</p>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Recipient Address</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                    />
                </div>

                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Amount (USDT)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setAmount(availableBalanceUSD.toFixed(2))}
                        >
                            Max
                        </Button>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={handleWithdraw}
                    disabled={isPending || isConfirming || !amount || !recipient || parseFloat(amount) > availableBalanceUSD}
                    className="w-full"
                >
                    {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Withdrawing...' : 'Withdraw Buffer'}
                </Button>
            </div>
        </Card>
    );
}

// ============ REVENUE SPLITTER SECTION ============
function RevenueSplitterSection() {
    const { data: pendingBalance, refetch: refetchBalance } = usePendingBalance();
    const { data: totalDistributed } = useTotalDistributed();
    const { data: totalSharePercent } = useTotalSharePercent();
    const { data: isConfigured } = useIsConfigured();
    const { data: shareholdersData, refetch: refetchShareholders } = useGetAllShareholders();

    const { distribute, isPending: distPending, isConfirming: distConfirming, isSuccess: distSuccess, error: distError } = useDistribute();
    const { addShareholder, isPending: addPending, isConfirming: addConfirming, isSuccess: addSuccess, error: addError } = useAddShareholder();
    const { removeShareholder, isPending: remPending, isConfirming: remConfirming, isSuccess: remSuccess } = useRemoveShareholder();
    const { batchAddShareholders, isPending: batchPending, isConfirming: batchConfirming, isSuccess: batchSuccess, error: batchError } = useBatchAddShareholders();

    const [newWallet, setNewWallet] = useState('');
    const [newShare, setNewShare] = useState('');
    const [batchEntries, setBatchEntries] = useState<{ wallet: string, share: string }[]>([
        { wallet: '', share: '' },
        { wallet: '', share: '' },
    ]);
    const [removingAddr, setRemovingAddr] = useState<string | null>(null);
    const toastShown = useRef(false);

    // Toast handlers
    useEffect(() => {
        if (distSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Funds distributed!');
            refetchBalance();
            refetchShareholders();
        }
        if (distError) toast.error('Distribution failed');
    }, [distSuccess, distError, refetchBalance, refetchShareholders]);

    useEffect(() => {
        if (addSuccess) {
            toast.success('Shareholder added!');
            setNewWallet('');
            setNewShare('');
            refetchShareholders();
        }
        if (addError) toast.error('Failed to add');
    }, [addSuccess, addError, refetchShareholders]);

    useEffect(() => {
        if (remSuccess) {
            toast.success('Removed!');
            setRemovingAddr(null);
            refetchShareholders();
        }
    }, [remSuccess, refetchShareholders]);

    useEffect(() => {
        if (batchSuccess) {
            toast.success('Shareholders configured!');
            setBatchEntries([{ wallet: '', share: '' }, { wallet: '', share: '' }]);
            refetchShareholders();
        }
        if (batchError) toast.error('Batch config failed');
    }, [batchSuccess, batchError, refetchShareholders]);

    // Parse shareholders
    const shareholders: { wallet: string; share: bigint; totalPaid: bigint }[] = [];
    if (shareholdersData) {
        const [wallets, shares, totalPaid] = shareholdersData as [string[], bigint[], bigint[]];
        for (let i = 0; i < wallets.length; i++) {
            shareholders.push({ wallet: wallets[i], share: shares[i], totalPaid: totalPaid[i] });
        }
    }

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleDistribute = () => {
        toastShown.current = false;
        distribute();
    };

    const handleAddShareholder = () => {
        if (!newWallet || !newShare) return;
        addShareholder(newWallet as `0x${string}`, BigInt(newShare));
    };

    const handleRemove = (wallet: string) => {
        setRemovingAddr(wallet);
        removeShareholder(wallet as `0x${string}`);
    };

    const updateBatchEntry = (idx: number, field: 'wallet' | 'share', value: string) => {
        const updated = [...batchEntries];
        updated[idx][field] = value;
        setBatchEntries(updated);
    };

    const batchTotal = batchEntries.reduce((sum, e) => sum + (parseInt(e.share) || 0), 0);

    const handleBatchAdd = () => {
        const valid = batchEntries.filter(e => e.wallet && e.share);
        if (valid.length === 0) return;
        batchAddShareholders(
            valid.map(e => e.wallet as `0x${string}`),
            valid.map(e => BigInt(e.share))
        );
    };

    return (
        <Card variant="glow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#F8FAFC]">💸 Revenue Splitter</h3>
                    <p className="text-xs text-[#64748B]">Manage creator commission distribution</p>
                    <p className="text-[10px] text-[#EC4899] font-mono mt-1">{CONTRACTS.REVENUE_SPLITTER}</p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDistribute}
                    disabled={distPending || distConfirming || !isConfigured || !pendingBalance || pendingBalance === BigInt(0)}
                >
                    {distPending || distConfirming ? '...' : '💸 Distribute'}
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[10px] text-[#64748B]">Pending</p>
                    <p className="text-lg font-bold text-[#10B981]">{formatUSDT(pendingBalance as bigint)}</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[10px] text-[#64748B]">Total Distributed</p>
                    <p className="text-lg font-bold text-[#3B82F6]">{formatUSDT(totalDistributed as bigint)}</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg text-center">
                    <p className="text-[10px] text-[#64748B]">Allocation</p>
                    <p className={`text-lg font-bold ${isConfigured ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {totalSharePercent?.toString() || '0'}%
                    </p>
                </div>
            </div>

            {/* Current Shareholders */}
            {shareholders.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-[#64748B] mb-2">👥 Shareholders</p>
                    <div className="space-y-2">
                        {shareholders.map((sh, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-[#0F172A] rounded-lg">
                                <div className="flex-1 min-w-0 mr-2">
                                    <p className="text-xs text-[#F8FAFC] font-mono truncate">{sh.wallet}</p>
                                    <p className="text-[10px] text-[#64748B]">{sh.share.toString()}% • Paid: {formatUSDT(sh.totalPaid)}</p>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemove(sh.wallet)}
                                    disabled={remPending || remConfirming}
                                >
                                    {removingAddr === sh.wallet ? '...' : '✕'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Single */}
            <div className="p-3 bg-[#0F172A] rounded-lg mb-4">
                <p className="text-xs text-[#64748B] mb-2">➕ Add Shareholder</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-2 py-1.5 bg-[#1E293B] border border-[#334155] rounded text-white font-mono text-xs"
                    />
                    <input
                        type="number"
                        value={newShare}
                        onChange={(e) => setNewShare(e.target.value)}
                        placeholder="%"
                        className="w-16 px-2 py-1.5 bg-[#1E293B] border border-[#334155] rounded text-white text-xs"
                    />
                    <Button variant="primary" size="sm" onClick={handleAddShareholder} disabled={addPending || addConfirming}>
                        {addPending || addConfirming ? '...' : '+'}
                    </Button>
                </div>
            </div>

            {/* Batch Config */}
            <div className="p-3 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg">
                <p className="text-xs text-[#EC4899] font-bold mb-2">🔄 Batch Configure (Replaces All - Must = 100%)</p>
                <div className="space-y-2">
                    {batchEntries.map((entry, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={entry.wallet}
                                onChange={(e) => updateBatchEntry(idx, 'wallet', e.target.value)}
                                placeholder="0x..."
                                className="flex-1 px-2 py-1.5 bg-[#0F172A] border border-[#334155] rounded text-white font-mono text-xs"
                            />
                            <input
                                type="number"
                                value={entry.share}
                                onChange={(e) => updateBatchEntry(idx, 'share', e.target.value)}
                                placeholder="%"
                                className="w-16 px-2 py-1.5 bg-[#0F172A] border border-[#334155] rounded text-white text-xs"
                            />
                            {batchEntries.length > 1 && (
                                <button
                                    onClick={() => setBatchEntries(batchEntries.filter((_, i) => i !== idx))}
                                    className="text-red-500 text-xs px-2"
                                >✕</button>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-2">
                        <button
                            onClick={() => setBatchEntries([...batchEntries, { wallet: '', share: '' }])}
                            className="text-xs text-[#3B82F6]"
                        >+ Add More</button>
                        <span className={`text-xs font-bold ${batchTotal === 100 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            Total: {batchTotal}%
                        </span>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleBatchAdd}
                        disabled={batchPending || batchConfirming || batchTotal !== 100}
                        className="w-full mt-2"
                    >
                        {batchPending || batchConfirming ? 'Configuring...' : '🚀 Configure All'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// NFT Settings Component - Just displays current values (editing done in NFTsTab)
function NFTSettings() {
    const [queueCount, setQueueCountVal] = useState('');
    const toastShownQueue = useRef(false);

    // Read current values
    const { data: currentSplitThreshold } = useNFTSplitThreshold();
    const { data: currentSplitCount } = useNFTSplitCount();
    const { data: currentQueueCount } = useNFTQueueCount();

    // Write hooks
    const { setQueueCount, isPending: queuePending, isConfirming: queueConfirming, isSuccess: queueSuccess, error: queueError } = useSetQueueCount();

    // Toast notifications

    useEffect(() => {
        if (queueSuccess && !toastShownQueue.current) {
            toastShownQueue.current = true;
            toast.success('Queue count updated!');
            setQueueCountVal('');
        }
        if (queueError && !toastShownQueue.current) {
            toastShownQueue.current = true;
            toast.error('Failed to update queue count');
        }
    }, [queueSuccess, queueError]);

    const handleSetQueueCount = () => {
        if (!queueCount) return;
        toastShownQueue.current = false;
        setQueueCount(BigInt(queueCount));
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">🎨 NFT Settings</h3>
            <p className="text-xs text-[#64748B] mb-4">Configure NFT split and queue behavior</p>

            {/* Current Values */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-[#1E293B] rounded-lg">
                    <p className="text-[10px] text-[#64748B]">Split Threshold</p>
                    <p className="text-lg font-bold text-[#F59E0B]">${currentSplitThreshold ? Number(formatUnits(currentSplitThreshold as bigint, 18)).toFixed(0) : '0'}</p>
                    <p className="text-[8px] text-[#64748B]">Fixed (read-only)</p>
                </div>
                <div className="p-3 bg-[#1E293B] rounded-lg">
                    <p className="text-[10px] text-[#64748B]">Split Count</p>
                    <p className="text-lg font-bold text-[#EC4899]">{currentSplitCount?.toString() || '0'}</p>
                    <p className="text-[8px] text-[#64748B]">NFTs on split</p>
                </div>
                <div className="p-3 bg-[#1E293B] rounded-lg">
                    <p className="text-[10px] text-[#64748B]">Queue Count</p>
                    <p className="text-lg font-bold text-[#8B5CF6]">{currentQueueCount?.toString() || '0'}</p>
                    <p className="text-[8px] text-[#64748B]">Max unlisted</p>
                </div>
            </div>


            {/* Queue Count Input */}
            <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Set Queue Count (1-10)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={queueCount}
                        onChange={(e) => setQueueCountVal(e.target.value)}
                        placeholder="e.g., 1"
                        min="1"
                        max="10"
                        className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#8B5CF6] outline-none"
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSetQueueCount}
                        disabled={queuePending || queueConfirming || !queueCount}
                    >
                        {queuePending || queueConfirming ? '...' : 'Set'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
