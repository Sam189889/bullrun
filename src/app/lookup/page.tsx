'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Wrapper component for Suspense
export default function LookupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>}>
            <LookupContent />
        </Suspense>
    );
}

function LookupContent() {
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');

    const [searchInput, setSearchInput] = useState(urlId || '');
    const [searchType, setSearchType] = useState<'id' | 'wallet'>('id');
    const [userId, setUserId] = useState<bigint | null>(urlId ? BigInt(urlId) : null);
    const [searchedWallet, setSearchedWallet] = useState<string | null>(null);

    // Auto-load from URL param
    useEffect(() => {
        if (urlId && !isNaN(Number(urlId))) {
            setUserId(BigInt(urlId));
            setSearchInput(urlId);
        }
    }, [urlId]);

    // If searching by wallet, first get the user ID
    const { data: walletUserId, isLoading: walletIdLoading } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'walletToUserId',
        args: searchedWallet ? [searchedWallet as `0x${string}`] : undefined,
        query: { enabled: !!searchedWallet }
    });

    // Fetch user data by ID
    const { data: userData, isLoading: userLoading } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'users',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) }
    });

    // Get user wallet from allUsers (0-indexed)
    const { data: userWallet } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'allUsers',
        args: userId ? [userId - BigInt(1)] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) }
    });

    // Get user earnings
    const { data: earningsData } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'packageEarnings',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) }
    });

    // Get user balance
    const { data: balanceData } = useReadContract({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'userBalances',
        args: userId ? [userId] : undefined,
        query: { enabled: !!userId && userId > BigInt(0) }
    });

    // Update userId when wallet lookup returns
    useEffect(() => {
        if (walletUserId && Number(walletUserId) > 0) {
            setUserId(walletUserId as bigint);
        }
    }, [walletUserId]);

    // Parse user data
    const user = userData as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint] | undefined;
    const earnings = earningsData as readonly [bigint, bigint, bigint, bigint] | undefined;
    const balance = balanceData as readonly [bigint, bigint, bigint] | undefined;

    const formatUSDT = (value: bigint | undefined) => {
        if (!value) return '$0';
        return `$${Number(formatUnits(value, 18)).toLocaleString()}`;
    };

    const handleSearch = () => {
        if (!searchInput.trim()) return;

        if (searchType === 'id') {
            const id = parseInt(searchInput);
            if (!isNaN(id) && id > 0) {
                setUserId(BigInt(id));
                setSearchedWallet(null);
            }
        } else {
            // Wallet search
            if (searchInput.startsWith('0x') && searchInput.length === 42) {
                setSearchedWallet(searchInput);
                setUserId(null);
            }
        }
    };

    const isLoading = userLoading || walletIdLoading;
    const userFound = user && userId && userId > BigInt(0);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🐂</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">
                                Bull Run
                            </span>
                        </Link>
                        <Link href="/" className="text-sm text-[#64748B] hover:text-[#F8FAFC]">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">🔍 User Lookup</h1>
                <p className="text-sm text-[#64748B] mb-6">Search for any user by ID or wallet address</p>

                {/* Search Box */}
                <Card variant="glow" className="mb-6">
                    <div className="space-y-4">
                        {/* Search Type Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSearchType('id')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchType === 'id'
                                    ? 'bg-[#EC4899] text-white'
                                    : 'bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC]'
                                    }`}
                            >
                                Search by ID
                            </button>
                            <button
                                onClick={() => setSearchType('wallet')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchType === 'wallet'
                                    ? 'bg-[#EC4899] text-white'
                                    : 'bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC]'
                                    }`}
                            >
                                Search by Wallet
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={searchType === 'id' ? 'Enter User ID (e.g., 1)' : 'Enter Wallet Address (0x...)'}
                                className="flex-1 px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                            />
                            <Button variant="primary" onClick={handleSearch} disabled={isLoading}>
                                {isLoading ? '...' : 'Search'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <p className="text-[#64748B]">Loading...</p>
                    </div>
                )}

                {/* Not Found */}
                {!isLoading && userId !== null && !userFound && (
                    <Card variant="stat" className="text-center py-12">
                        <p className="text-4xl mb-4">😔</p>
                        <p className="text-[#F8FAFC] font-medium">User not found</p>
                        <p className="text-sm text-[#64748B]">Try a different ID or wallet address</p>
                    </Card>
                )}

                {/* User Data */}
                {userFound && user && (
                    <div className="space-y-6">
                        {/* User Header */}
                        <Card variant="glow">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-[#EC4899]">User #{userId.toString()}</p>
                                    <p className="text-sm text-[#64748B] font-mono">{userWallet as string || '0x...'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${user[4] ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                                    }`}>
                                    {user[4] ? '✅ Active' : '⏳ Inactive'}
                                </span>
                            </div>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon="📦"
                                label="Package Level"
                                value={`Pkg ${Number(user[1])}`}
                            />
                            <StatCard
                                icon="💰"
                                label="Total Invested"
                                value={formatUSDT(user[2])}
                            />
                            <StatCard
                                icon="🎯"
                                label="Earning Cap"
                                value={formatUSDT(user[3])}
                            />
                            <StatCard
                                icon="👥"
                                label="Direct Referrals"
                                value={Number(user[6]).toString()}
                            />
                        </div>

                        {/* Earnings Breakdown */}
                        {earnings && (
                            <Card variant="stat">
                                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">📈 Earnings Breakdown</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <p className="text-xs text-[#64748B]">Direct Sponsor</p>
                                        <p className="text-lg font-bold text-[#EC4899]">{formatUSDT(earnings[0])}</p>
                                    </div>
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <p className="text-xs text-[#64748B]">Level Income</p>
                                        <p className="text-lg font-bold text-[#3B82F6]">{formatUSDT(earnings[1])}</p>
                                    </div>
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <p className="text-xs text-[#64748B]">Rank EMI</p>
                                        <p className="text-lg font-bold text-[#10B981]">{formatUSDT(earnings[2])}</p>
                                    </div>
                                    <div className="bg-[#0F172A] rounded-lg p-3">
                                        <p className="text-xs text-[#64748B]">Fast Bonus</p>
                                        <p className="text-lg font-bold text-[#D946EF]">{formatUSDT(earnings[3])}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Balance Info */}
                        {balance && (
                            <Card variant="stat">
                                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">💰 Balance Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#0F172A] rounded-lg p-3 text-center">
                                        <p className="text-xs text-[#64748B]">Total Earned</p>
                                        <p className="text-xl font-bold text-[#10B981]">{formatUSDT(balance[0])}</p>
                                    </div>
                                    <div className="bg-[#0F172A] rounded-lg p-3 text-center">
                                        <p className="text-xs text-[#64748B]">Available</p>
                                        <p className="text-xl font-bold text-[#EC4899]">{formatUSDT(balance[1])}</p>
                                    </div>
                                    <div className="bg-[#0F172A] rounded-lg p-3 text-center">
                                        <p className="text-xs text-[#64748B]">Withdrawn</p>
                                        <p className="text-xl font-bold text-[#64748B]">{formatUSDT(balance[2])}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Referrer Info */}
                        {user[0] > BigInt(0) && (
                            <Card variant="stat">
                                <p className="text-sm text-[#64748B]">
                                    Referred by: <span className="text-[#EC4899] font-bold">User #{Number(user[0])}</span>
                                </p>
                            </Card>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
