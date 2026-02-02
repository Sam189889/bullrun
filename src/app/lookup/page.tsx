'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LookupUserProvider } from '@/contexts/LookupContext';
import Link from 'next/link';

// Import actual dashboard components
import { HomeTab } from '@/app/dashboard/components/HomeTab';
import { EarningsTab } from '@/app/dashboard/components/EarningsTab';
import { MyNFTsTab } from '@/app/dashboard/components/MyNFTsTab';
import { TeamRankTab } from '@/app/dashboard/components/TeamRankTab';
import { HistoryTab } from '@/app/dashboard/components/HistoryTab';

// Wrapper component for Suspense
export default function LookupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>}>
            <LookupContent />
        </Suspense>
    );
}

// Tab configuration
const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'nfts', label: 'NFTs', icon: '🖼️' },
    { id: 'team', label: 'Team & Ranks', icon: '👥' },
    { id: 'history', label: 'History', icon: '📜' },
];

function LookupContent() {
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');

    const [searchInput, setSearchInput] = useState(urlId || '');
    const [searchType, setSearchType] = useState<'id' | 'wallet'>('id');
    const [userId, setUserId] = useState<bigint | null>(urlId ? BigInt(urlId) : null);
    const [searchedWallet, setSearchedWallet] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('home');

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

    // Update userId when wallet lookup returns
    useEffect(() => {
        if (walletUserId && Number(walletUserId) > 0) {
            setUserId(walletUserId as bigint);
        }
    }, [walletUserId]);

    // Parse user data
    const user = userData as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint] | undefined;

    const handleSearch = () => {
        if (!searchInput.trim()) return;

        if (searchType === 'id') {
            const id = parseInt(searchInput);
            if (!isNaN(id) && id > 0) {
                setUserId(BigInt(id));
                setSearchedWallet(null);
            }
        } else {
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
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-sm text-[#EC4899] hover:text-[#D946EF]">
                                Admin Panel
                            </Link>
                            <Link href="/" className="text-sm text-[#64748B] hover:text-[#F8FAFC]">
                                ← Home
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 max-w-6xl">
                <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">🔍 User Lookup</h1>
                <p className="text-sm text-[#64748B] mb-6">View any user's complete dashboard (read-only)</p>

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

                {/* User Data - Wrapped in LookupUserProvider */}
                {userFound && user && (
                    <LookupUserProvider userId={userId} wallet={userWallet as string || null}>
                        <div className="space-y-6">
                            {/* User Header */}
                            <Card variant="glow">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center text-2xl shrink-0">
                                        🐂
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="text-xl font-bold text-[#EC4899]">BULL{user[7]?.toString()}</p>
                                            <span className="text-sm text-[#64748B]">ID: {userId.toString()}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs ${user[4] ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                                {user[4] ? '✅ Active' : '⏳ Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#64748B] font-mono truncate mt-1">{userWallet as string || '0x...'}</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium">
                                        👁️ View Only
                                    </div>
                                </div>
                            </Card>

                            {/* Tab Navigation */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/20'
                                            : 'bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#334155]'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content - Using ACTUAL Dashboard Components */}
                            <div className="min-h-[400px]">
                                {activeTab === 'home' && <HomeTab />}
                                {activeTab === 'earnings' && <EarningsTab />}
                                {activeTab === 'nfts' && <MyNFTsTab />}
                                {activeTab === 'team' && <TeamRankTab />}
                                {activeTab === 'history' && <HistoryTab />}
                            </div>
                        </div>
                    </LookupUserProvider>
                )}
            </main>
        </div>
    );
}
