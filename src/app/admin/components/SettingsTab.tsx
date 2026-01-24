'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import { useSetWallets, useDepositToPool, useWithdrawFromPool, useApproveUSDT, usePoolBalance, useSetFirstUser, useSetPaymentToken, useFirstUser, useUSDTAddress, useSetDaySettings, useDayStartTimestamp, useDayLength, useCurrentDay } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';

export function SettingsTab() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC]">⚙️ Settings</h2>
                <p className="text-sm text-[#64748B]">Platform configuration and pool management</p>
            </div>

            {/* Contract Settings */}
            <ContractSettings />

            {/* Wallet Configuration */}
            <WalletSettings />

            {/* Pool Management */}
            <PoolManagement />
        </div>
    );
}

// Contract Configuration Component
function ContractSettings() {
    const [firstUserAddress, setFirstUserAddress] = useState('');
    const [paymentTokenAddress, setPaymentTokenAddress] = useState('');
    const [dayStartTimestamp, setDayStartTimestamp] = useState('');
    const [dayLength, setDayLength] = useState('86400');
    const toastShown1 = useRef(false);
    const toastShown2 = useRef(false);
    const toastShown3 = useRef(false);

    const { data: currentFirstUser } = useFirstUser();
    const { data: currentUSDT } = useUSDTAddress();
    const { data: currentDayStart } = useDayStartTimestamp();
    const { data: currentDayLength } = useDayLength();
    const { data: currentDay } = useCurrentDay();
    
    const { setFirstUser, isPending: pending1, isConfirming: confirming1, isSuccess: success1, error: error1 } = useSetFirstUser();
    const { setPaymentToken, isPending: pending2, isConfirming: confirming2, isSuccess: success2, error: error2 } = useSetPaymentToken();
    const { setDaySettings, isPending: pending3, isConfirming: confirming3, isSuccess: success3, error: error3 } = useSetDaySettings();

    useEffect(() => {
        if (success1 && !toastShown1.current) {
            toastShown1.current = true;
            toast.success('First user updated!');
            setFirstUserAddress('');
        }
        if (error1 && !toastShown1.current) {
            toastShown1.current = true;
            toast.error('Failed to set first user');
        }
    }, [success1, error1]);

    useEffect(() => {
        if (success2 && !toastShown2.current) {
            toastShown2.current = true;
            toast.success('Payment token updated!');
            setPaymentTokenAddress('');
        }
        if (error2 && !toastShown2.current) {
            toastShown2.current = true;
            toast.error('Failed to set payment token');
        }
    }, [success2, error2]);

    useEffect(() => {
        if (success3 && !toastShown3.current) {
            toastShown3.current = true;
            toast.success('Day settings initialized! Daily limits are now active.');
            setDayStartTimestamp('');
        }
        if (error3 && !toastShown3.current) {
            toastShown3.current = true;
            toast.error('Failed to set day settings');
        }
    }, [success3, error3]);

    const handleSetFirstUser = () => {
        if (!firstUserAddress) return;
        toastShown1.current = false;
        setFirstUser(firstUserAddress as `0x${string}`);
    };

    const handleSetPaymentToken = () => {
        if (!paymentTokenAddress) return;
        toastShown2.current = false;
        setPaymentToken(paymentTokenAddress as `0x${string}`);
    };

    const handleInitializeDaySettings = () => {
        if (!dayStartTimestamp || !dayLength) return;
        toastShown3.current = false;
        setDaySettings(BigInt(dayStartTimestamp), BigInt(dayLength));
    };

    const handleUseCurrentTime = () => {
        const now = Math.floor(Date.now() / 1000);
        setDayStartTimestamp(now.toString());
    };

    return (
        <Card variant="stat" hover>
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">🔧 Contract Settings</h3>

            {/* Current Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {Boolean(currentFirstUser) && (
                    <div className="p-3 bg-[#0F172A] rounded-lg">
                        <p className="text-xs text-[#64748B] mb-1">Current First User</p>
                        <p className="text-sm text-[#F8FAFC] font-mono truncate">{String(currentFirstUser)}</p>
                    </div>
                )}
                {Boolean(currentUSDT) && (
                    <div className="p-3 bg-[#0F172A] rounded-lg">
                        <p className="text-xs text-[#64748B] mb-1">Current USDT Token</p>
                        <p className="text-sm text-[#10B981] font-mono truncate">{String(currentUSDT)}</p>
                    </div>
                )}
            </div>

            {/* Current Day Settings */}
            {Boolean(currentDayStart) && currentDayStart !== BigInt(0) && (
                <div className="p-3 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg mb-4">
                    <p className="text-xs text-[#EC4899] font-bold mb-2">📅 Current Day Settings (Active)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Day Start Time</p>
                            <p className="text-xs text-[#F8FAFC] font-mono">
                                {new Date(Number(currentDayStart) * 1000).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Day Length</p>
                            <p className="text-xs text-[#F8FAFC]">
                                {currentDayLength ? `${Number(currentDayLength) / 3600} hours` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Current Day #</p>
                            <p className="text-xs text-[#10B981] font-bold">
                                Day {currentDay?.toString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Set First User */}
                <div className="p-3 bg-[#0F172A] rounded-lg">
                    <label className="text-sm text-[#F8FAFC] block mb-1">Set First User</label>
                    <p className="text-xs text-[#64748B] mb-2">Root user / company wallet address</p>
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
                            disabled={pending1 || confirming1 || !firstUserAddress}
                        >
                            {pending1 || confirming1 ? '...' : 'Set'}
                        </Button>
                    </div>
                </div>

                {/* Set Payment Token */}
                <div className="p-3 bg-[#0F172A] rounded-lg">
                    <label className="text-sm text-[#F8FAFC] block mb-1">Set Payment Token</label>
                    <p className="text-xs text-[#64748B] mb-2">USDT contract address</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={paymentTokenAddress}
                            onChange={(e) => setPaymentTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                        />
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleSetPaymentToken}
                            disabled={pending2 || confirming2 || !paymentTokenAddress}
                        >
                            {pending2 || confirming2 ? '...' : 'Set'}
                        </Button>
                    </div>
                </div>

                {/* Initialize Day Settings */}
                <div className="p-3 bg-[#0F172A] rounded-lg border-2 border-[#EC4899]/30">
                    <label className="text-sm text-[#F8FAFC] block mb-1">🕐 Initialize Day Settings</label>
                    <p className="text-xs text-[#64748B] mb-3">
                        Required for daily trading limits. Day 0 start timestamp and day length in seconds.
                        <span className="block mt-1 text-[#EC4899]">⚠️ Run this once after deployment!</span>
                    </p>
                    
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs text-[#94A3B8] block mb-1">Quick Select Timezone</label>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const offset = parseInt(e.target.value);
                                        const now = Math.floor(Date.now() / 1000);
                                        setDayStartTimestamp((now + offset).toString());
                                    }
                                }}
                                className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                            >
                                <option value="">Select Country/Timezone</option>
                                <option value="19800">🇮🇳 India (IST, UTC+5:30)</option>
                                <option value="14400">🇦🇪 Dubai (GST, UTC+4:00)</option>
                                <option value="0">🇬🇧 London (GMT, UTC+0:00)</option>
                                <option value="-18000">🇺🇸 New York (EST, UTC-5:00)</option>
                                <option value="-28800">🇺🇸 Los Angeles (PST, UTC-8:00)</option>
                                <option value="32400">🇯🇵 Tokyo (JST, UTC+9:00)</option>
                                <option value="28800">🇨🇳 China (CST, UTC+8:00)</option>
                                <option value="28800">🇸🇬 Singapore (SGT, UTC+8:00)</option>
                                <option value="36000">🇦🇺 Sydney (AEST, UTC+10:00)</option>
                                <option value="10800">🇷🇺 Moscow (MSK, UTC+3:00)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-xs text-[#94A3B8] block mb-1">Adjust Time (Optional)</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    onClick={() => {
                                        if (!dayStartTimestamp) return;
                                        const ts = parseInt(dayStartTimestamp);
                                        const date = new Date(ts * 1000);
                                        date.setHours(0, 0, 0, 0);
                                        setDayStartTimestamp(Math.floor(date.getTime() / 1000).toString());
                                    }}
                                    disabled={!dayStartTimestamp}
                                    className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    🌙 Set to Midnight (12:00 AM)
                                </button>
                                <button
                                    onClick={() => {
                                        if (!dayStartTimestamp) return;
                                        const ts = parseInt(dayStartTimestamp);
                                        const date = new Date(ts * 1000);
                                        date.setHours(12, 0, 0, 0);
                                        setDayStartTimestamp(Math.floor(date.getTime() / 1000).toString());
                                    }}
                                    disabled={!dayStartTimestamp}
                                    className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ☀️ Set to Noon (12:00 PM)
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        if (!dayStartTimestamp) return;
                                        const ts = parseInt(dayStartTimestamp);
                                        const newTs = ts - 86400; // Subtract 1 day
                                        setDayStartTimestamp(newTs.toString());
                                    }}
                                    disabled={!dayStartTimestamp}
                                    className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ⬅️ Previous Day (-24h)
                                </button>
                                <button
                                    onClick={() => {
                                        if (!dayStartTimestamp) return;
                                        const ts = parseInt(dayStartTimestamp);
                                        const newTs = ts + 86400; // Add 1 day
                                        setDayStartTimestamp(newTs.toString());
                                    }}
                                    disabled={!dayStartTimestamp}
                                    className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Day (+24h) ➡️
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs text-[#94A3B8] block mb-1">Start Timestamp (Unix)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={dayStartTimestamp}
                                    onChange={(e) => setDayStartTimestamp(e.target.value)}
                                    placeholder="1737565800"
                                    className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleUseCurrentTime}
                                >
                                    Now
                                </Button>
                            </div>
                            {dayStartTimestamp && (
                                <p className="text-[10px] text-[#10B981] mt-1">
                                    📅 {new Date(parseInt(dayStartTimestamp) * 1000).toLocaleString('en-US', { 
                                        dateStyle: 'full', 
                                        timeStyle: 'long'
                                    })}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-xs text-[#94A3B8] block mb-1">Day Length (seconds)</label>
                            <input
                                type="text"
                                value={dayLength}
                                onChange={(e) => setDayLength(e.target.value)}
                                placeholder="86400"
                                className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                            />
                            <p className="text-[10px] text-[#64748B] mt-1">Default: 86400 (24 hours)</p>
                        </div>
                        
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleInitializeDaySettings}
                            disabled={pending3 || confirming3 || !dayStartTimestamp || !dayLength}
                            className="w-full"
                        >
                            {pending3 || confirming3 ? 'Initializing...' : '🚀 Initialize Day Settings'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Wallet Configuration Component
function WalletSettings() {
    const [wallets, setWallets] = useState({
        buffer: '',
        creator: '',
        trip: '',
        luckyDraw: '',
    });
    const toastShown = useRef(false);

    const { setWallets: setWalletsContract, isPending, isConfirming, isSuccess, error } = useSetWallets();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Wallets updated successfully!');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to update wallets');
        }
    }, [isSuccess, error]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toastShown.current = false;

        if (!wallets.buffer || !wallets.creator || !wallets.trip || !wallets.luckyDraw) {
            toast.error('All wallet addresses are required');
            return;
        }

        setWalletsContract(
            wallets.buffer as `0x${string}`,
            wallets.creator as `0x${string}`,
            wallets.trip as `0x${string}`,
            wallets.luckyDraw as `0x${string}`
        );
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">💼 Distribution Wallets</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {[
                    { key: 'buffer', label: 'Buffer Wallet', desc: 'Buffer reserve wallet' },
                    { key: 'creator', label: 'Creator Wallet', desc: 'Creator commission wallet' },
                    { key: 'trip', label: 'Trip Wallet', desc: 'Trip reward wallet' },
                    { key: 'luckyDraw', label: 'Lucky Draw Wallet', desc: 'Lucky draw pool wallet' },
                ].map((item) => (
                    <div key={item.key} className="p-3 bg-[#0F172A] rounded-lg">
                        <label className="text-sm text-[#F8FAFC] block mb-1">{item.label}</label>
                        <p className="text-xs text-[#64748B] mb-2">{item.desc}</p>
                        <input
                            type="text"
                            value={wallets[item.key as keyof typeof wallets]}
                            onChange={(e) => setWallets({ ...wallets, [item.key]: e.target.value })}
                            placeholder="0x..."
                            className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                        />
                    </div>
                ))}

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isPending || isConfirming}
                    className="w-full"
                >
                    {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Updating...' : 'Update Wallets'}
                </Button>
            </form>
        </Card>
    );
}

// Pool Management Component
function PoolManagement() {
    const { address } = useAccount();
    const { data: poolBalance } = usePoolBalance();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const formatPool = () => {
        if (!poolBalance) return '$0';
        return `$${Number(formatUnits(poolBalance as bigint, 18)).toLocaleString()}`;
    };

    return (
        <Card variant="glow">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">💰 Main Pool (EMI/Rewards)</h3>

            <div className="text-center p-6 bg-[#0F172A] rounded-xl mb-4">
                <p className="text-[#64748B] text-sm mb-2">Main Pool Balance</p>
                <p className="text-3xl font-bold text-[#10B981] font-mono">{formatPool()}</p>
                <p className="text-xs text-[#64748B] mt-2">Used for Rank EMI, Fast Bonus payments</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="primary" onClick={() => setShowDepositModal(true)}>
                    Deposit
                </Button>
                <Button variant="danger" onClick={() => setShowWithdrawModal(true)}>
                    Withdraw
                </Button>
            </div>

            {/* Deposit Modal */}
            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
            />

            {/* Withdraw Modal */}
            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
            />
        </Card>
    );
}

// Deposit Modal
function DepositModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'approve' | 'deposit'>('approve');
    const toastShown = useRef(false);

    const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess, error: approveError } = useApproveUSDT();
    const { depositToPool, isPending: depositPending, isConfirming: depositConfirming, isSuccess: depositSuccess, error: depositError } = useDepositToPool();

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
        }
        if (depositError && !toastShown.current) {
            toastShown.current = true;
            toast.error('Deposit failed');
        }
    }, [depositSuccess, depositError, onClose]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            toastShown.current = false;
            setStep('approve');
        }
    }, [isOpen]);

    const handleApprove = () => {
        if (!amount) return;
        toastShown.current = false;
        approve(amount);
    };

    const handleDeposit = () => {
        if (!amount) return;
        toastShown.current = false;
        depositToPool(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deposit to Pool" size="sm">
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

// Withdraw Modal
function WithdrawModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState('');
    const [toAddress, setToAddress] = useState('');
    const toastShown = useRef(false);

    const { withdrawFromPool, isPending, isConfirming, isSuccess, error } = useWithdrawFromPool();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Withdrawal successful!');
            onClose();
            setAmount('');
            setToAddress('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Withdrawal failed');
        }
    }, [isSuccess, error, onClose]);

    useEffect(() => {
        if (isOpen) {
            toastShown.current = false;
        }
    }, [isOpen]);

    const handleWithdraw = () => {
        if (!amount || !toAddress) {
            toast.error('Enter amount and address');
            return;
        }
        toastShown.current = false;
        withdrawFromPool(toAddress as `0x${string}`, amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Withdraw from Pool" size="sm">
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
