'use client';

import { useState, useEffect } from 'react';
import {
    useAdminNFTs,
    useNFTStats,
    hideNFT,
    pinNFT,
    type NFT
} from '@/hooks/useAdminAPI';
import toast from 'react-hot-toast';

export function NFTTabsSection() {
    const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'hidden'>('all');
    const { stats, loading: statsLoading, refetch: refetchStats } = useNFTStats();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    label="Total NFTs"
                    value={stats?.total || 0}
                    icon="📊"
                    color="blue"
                    loading={statsLoading}
                />
                <StatCard
                    label="Active"
                    value={stats?.active || 0}
                    icon="✅"
                    color="emerald"
                    loading={statsLoading}
                />
                <StatCard
                    label="Burned"
                    value={stats?.burned || 0}
                    icon="🔥"
                    color="red"
                    loading={statsLoading}
                />
                <StatCard
                    label="Pinned"
                    value={stats?.pinned || 0}
                    icon="📌"
                    color="purple"
                    loading={statsLoading}
                />
                <StatCard
                    label="Hidden"
                    value={stats?.hidden || 0}
                    icon="🙈"
                    color="yellow"
                    loading={statsLoading}
                />
                <StatCard
                    label="Avg Price"
                    value={`$${Number(stats?.avg_price || 0).toFixed(2)}`}
                    icon="💰"
                    color="green"
                    loading={statsLoading}
                />
            </div>

            {/* Tabs */}
            <div className="sticky top-16 sm:top-20 z-40 bg-[#0F172A] py-2 -mx-3 sm:-mx-4 px-3 sm:px-4 border-b border-slate-800">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto hide-scrollbar">
                    <TabButton
                        active={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                        label="All NFTs"
                        count={stats?.active || 0}
                    />
                    <TabButton
                        active={activeTab === 'pinned'}
                        onClick={() => setActiveTab('pinned')}
                        label="📌 Pinned"
                        count={stats?.pinned || 0}
                    />
                    <TabButton
                        active={activeTab === 'hidden'}
                        onClick={() => setActiveTab('hidden')}
                        label="🙈 Hidden"
                        count={stats?.hidden || 0}
                    />
                </div>
            </div>

            {/* Tab Content */}
            <NFTGrid
                tab={activeTab}
                onUpdate={() => {
                    refetchStats();
                }}
            />
        </div>
    );
}

// Stat Card Component
function StatCard({
    label,
    value,
    icon,
    color,
    loading
}: {
    label: string;
    value: number | string;
    icon: string;
    color: string;
    loading: boolean;
}) {
    const colorClasses = {
        blue: 'bg-blue-500/20 text-blue-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        red: 'bg-red-500/20 text-red-400',
        purple: 'bg-purple-500/20 text-purple-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        green: 'bg-green-500/20 text-green-400'
    };

    return (
        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <span className={`p-1 rounded-lg text-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </span>
                <p className="text-slate-400 text-sm">{label}</p>
            </div>
            {loading ? (
                <div className="h-8 bg-slate-700 animate-pulse rounded" />
            ) : (
                <p className="text-2xl font-bold text-white">{value}</p>
            )}
        </div>
    );
}

// Tab Button Component
function TabButton({
    active,
    onClick,
    label,
    count
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                active
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-slate-400 hover:text-slate-300'
            }`}
        >
            {label}
            <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-slate-700 rounded-full text-[10px] sm:text-xs">
                {count}
            </span>
        </button>
    );
}

// NFT Grid Component
function NFTGrid({ tab, onUpdate }: { tab: 'all' | 'pinned' | 'hidden'; onUpdate: () => void }) {
    const [sortBy, setSortBy] = useState('nft_id');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(1);

    const filters = {
        only_pinned: tab === 'pinned',
        only_hidden: tab === 'hidden',
        include_hidden: tab === 'hidden',
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset: (page - 1) * limit
    };

    const { data, loading, refetch } = useAdminNFTs(filters);

    // Reset to page 1 when tab or filters change
    useEffect(() => {
        setPage(1);
    }, [tab, sortBy, sortOrder, limit]);

    const handleUpdate = () => {
        refetch();
        onUpdate();
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-64 bg-slate-800/40 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!data || data.nfts.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-slate-500 text-lg">
                    {tab === 'all' && 'No NFTs found'}
                    {tab === 'pinned' && 'No pinned NFTs'}
                    {tab === 'hidden' && 'No hidden NFTs'}
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil(data.total / limit);
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, data.total);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm"
                    >
                        <option value="nft_id">NFT ID</option>
                        <option value="cached_current_price">Price</option>
                        <option value="cached_created_at">Created</option>
                        <option value="cached_last_traded_at">Last Traded</option>
                        <option value="cached_buy_count">Trade Count</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                        className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700"
                    >
                        {sortOrder === 'ASC' ? '↑ Asc' : '↓ Desc'}
                    </button>

                    {/* Quick Filter: Old Untouched NFTs */}
                    <button
                        onClick={() => {
                            setSortBy('cached_last_traded_at');
                            setSortOrder('ASC');
                            toast.success('Showing oldest untouched NFTs');
                        }}
                        className="px-3 sm:px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-lg text-yellow-400 text-xs sm:text-sm hover:bg-yellow-600/30 whitespace-nowrap"
                        title="Sort by oldest NFTs that haven't been traded in a long time"
                    >
                        ⏰ Old NFTs
                    </button>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-slate-400 text-xs sm:text-sm">Show:</span>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs sm:text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* NFT Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.nfts.map((nft) => (
                    <NFTCard key={nft.nft_id} nft={nft} onUpdate={handleUpdate} />
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="text-slate-400 text-sm">
                        Showing {startItem}-{endItem} of {data.total} NFTs
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Prev
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${
                                            page === pageNum
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// NFT Card Component
function NFTCard({ nft, onUpdate }: { nft: NFT; onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleHide = async () => {
        setLoading(true);
        try {
            await hideNFT(nft.nft_id, !nft.is_hidden, nft.is_hidden ? undefined : 'Admin hidden', '0xAdmin');
            toast.success(nft.is_hidden ? 'NFT shown' : 'NFT hidden');
            onUpdate();
        } catch (err) {
            toast.error('Failed to update NFT');
        } finally {
            setLoading(false);
        }
    };

    const handlePin = async () => {
        setLoading(true);
        try {
            await pinNFT(nft.nft_id, !nft.is_pinned);
            toast.success(nft.is_pinned ? 'NFT unpinned' : 'NFT pinned');
            onUpdate();
        } catch (err) {
            toast.error('Failed to update NFT');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        NFT #{nft.nft_id}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Owner: User {nft.owner_id}
                    </p>
                </div>
                <div className="flex gap-1">
                    {Boolean(nft.is_pinned) && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                            📌 Pin {nft.pin_order}
                        </span>
                    )}
                    {Boolean(nft.is_hidden) && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            🙈 Hidden
                        </span>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="mb-4">
                <p className="text-3xl font-bold text-emerald-400">
                    ${Number(nft.cached_current_price).toFixed(2)}
                </p>
                <p className="text-slate-500 text-sm">
                    {nft.cached_buy_count} trades
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-800/50 p-2 rounded-lg">
                    <p className="text-slate-500 text-xs">Status</p>
                    <p className="text-white text-sm font-medium">
                        {nft.cached_is_listed ? '✅ Listed' : '🔒 Queued'}
                    </p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                    <p className="text-slate-500 text-xs">Last Traded</p>
                    <p className="text-white text-sm font-medium">
                        {nft.cached_last_traded_at === 0 
                            ? 'Never' 
                            : new Date(nft.cached_last_traded_at * 1000).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleHide}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        nft.is_hidden
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    }`}
                >
                    {nft.is_hidden ? '👁️ Show' : '🙈 Hide'}
                </button>
                <button
                    onClick={handlePin}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        nft.is_pinned
                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {nft.is_pinned ? '📌 Unpin' : '📌 Pin'}
                </button>
            </div>

            {/* Admin Notes */}
            {nft.admin_notes && nft.admin_notes !== '' && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-500 text-xs mb-1">Admin Notes:</p>
                    <p className="text-slate-300 text-sm">{nft.admin_notes}</p>
                </div>
            )}
        </div>
    );
}
