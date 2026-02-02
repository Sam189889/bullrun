'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatUnits } from 'viem';
import {
    useTotalNFTs,
    useNFT,
    useNFTSplitThreshold,
    useNFTSplitCount,
    useNFTQueueCount,
    useNFTAppreciationBps,
    useCreateNFT,
    useSetSplitCount,
    useSetQueueCount
} from '@/hooks/useAdminContracts';

import { useUserInfo } from '@/hooks/useContracts';
import { useMarketplaceConfig } from '@/hooks/useMarketplaceConfig';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// Helper component to display owner username
function OwnerUsername({ ownerId }: { ownerId: bigint }) {
    const { data: userInfo } = useUserInfo(ownerId);

    if (!userInfo) return <span className="text-slate-500">Loading...</span>;

    // Wagmi returns struct as object with named fields
    const user = userInfo as { usernameId: bigint };

    return <span className="font-mono">BULL{user.usernameId.toString()}</span>;
}

export function NFTsTab() {
    const [basePrice, setBasePrice] = useState('10');
    const [nftCount, setNftCount] = useState('1');
    const [splitCount, setSplitCount] = useState('2');
    const [selectedNftId, setSelectedNftId] = useState<string>('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [showCreateMode, setShowCreateMode] = useState(false);
    const [queueCountInput, setQueueCountInput] = useState('');
    const [showQueueEdit, setShowQueueEdit] = useState(false);

    // Global marketplace config
    const { config: marketplaceConfig } = useMarketplaceConfig();

    // Reads - add refetch for all
    const { data: totalNFTs, refetch: refetchTotalNFTs } = useTotalNFTs();
    const { data: threshold, refetch: refetchThreshold } = useNFTSplitThreshold();
    const { data: count, refetch: refetchCount } = useNFTSplitCount();
    const { data: queueCount, refetch: refetchQueueCount } = useNFTQueueCount();
    const { data: appreciation, refetch: refetchAppreciation } = useNFTAppreciationBps();

    // Writes - get isSuccess to know when tx is confirmed
    const { createNFT, isPending: creating, isConfirming: creatingConfirming, isSuccess: createSuccess } = useCreateNFT();
    const { setSplitCount: updateSplitCount, isPending: settingSplit, isSuccess: settingsSuccess } = useSetSplitCount();
    const { setQueueCount: updateQueueCount, isPending: settingQueue, isSuccess: queueSuccess } = useSetQueueCount();

    // Refetch all data function
    const refetchAll = () => {
        refetchTotalNFTs();
        refetchThreshold();
        refetchCount();
        refetchQueueCount();
        refetchAppreciation();
    };

    // Refetch when NFT creation is confirmed
    useEffect(() => {
        if (createSuccess) {
            toast.success('NFT Created Successfully!');
            refetchAll();
        }
    }, [createSuccess]);

    // Refetch when settings update is confirmed
    useEffect(() => {
        if (settingsSuccess) {
            toast.success('Settings Updated Successfully!');
            refetchAll();
        }
    }, [settingsSuccess]);

    // Refetch when queue update is confirmed
    useEffect(() => {
        if (queueSuccess) {
            toast.success('Queue Count Updated!');
            setShowQueueEdit(false);
            setQueueCountInput('');
            refetchAll();
        }
    }, [queueSuccess]);

    const handleCreateNFT = async () => {
        try {
            const count = parseInt(nftCount) || 1;
            if (count < 1 || count > 50) {
                toast.error('Count must be between 1 and 50');
                return;
            }
            createNFT(basePrice, count);
            toast.success(`Creating ${count} NFT(s)...`);
        } catch (err) {
            toast.error('Failed to create NFT');
        }
    };

    const handleUpdateSettings = () => {
        // Show confirmation modal instead of direct update
        setShowConfirmModal(true);
    };

    const confirmUpdateSettings = async () => {
        try {
            await updateSplitCount(BigInt(splitCount));
            toast.success('Split Count Update Sent');
            setShowConfirmModal(false);
        } catch (err) {
            toast.error('Failed to update settings');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Total NFTs</p>
                    <p className="text-2xl font-bold text-white">{(totalNFTs as bigint)?.toString() || '0'}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Split Threshold</p>
                    <p className="text-2xl font-bold text-white">${threshold ? Number(formatUnits(threshold as bigint, 18)).toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Split Count</p>
                    <p className="text-2xl font-bold text-white">{(count as bigint)?.toString() || '0'}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Appreciation</p>
                    <p className="text-2xl font-bold text-white">{appreciation ? (Number(appreciation as bigint) / 100).toFixed(2) : '0'}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create NFT Form */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">➕</span>
                        Create New NFT
                    </h3>
                    {/* Info Card */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                        <p className="text-blue-400 text-sm font-semibold mb-2">📊 NFT Creation Info</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-slate-400">Default Price</p>
                                <p className="text-white font-bold">$10</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Appreciation</p>
                                <p className="text-emerald-400 font-bold">+8%</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Max Batch</p>
                                <p className="text-yellow-400 font-bold">50 NFTs</p>
                            </div>
                        </div>
                    </div>

                    {!showCreateMode ? (
                        <Button
                            onClick={() => setShowCreateMode(true)}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-lg font-semibold"
                        >
                            ➕ Create New NFT
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Base Price (USDT)</label>
                                    <input
                                        type="number"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Count (1-50)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={nftCount}
                                        onChange={(e) => setNftCount(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                            {/* Preview */}
                            <div className="bg-slate-800/50 rounded-lg p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Base Price:</span>
                                    <span className="text-white font-bold">${basePrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Listing Price (+8%):</span>
                                    <span className="text-emerald-400 font-bold">${(Number(basePrice) * 1.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                                    <span className="text-slate-400">Creating:</span>
                                    <span className="text-yellow-400 font-bold">{nftCount || 1} NFT(s)</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => setShowCreateMode(false)}
                                    className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateNFT}
                                    disabled={creating}
                                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold"
                                >
                                    {creating ? 'Creating...' : `Mint ${parseInt(nftCount) || 1} NFT(s)`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Settings */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">⚙️</span>
                        Split Settings
                    </h3>

                    {/* Current Values Display */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                        <p className="text-purple-400 text-sm font-semibold mb-2">📊 Current Settings</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-slate-400">Threshold</p>
                                <p className="text-white font-bold">${threshold ? Number(formatUnits(threshold as bigint, 18)).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Split Count</p>
                                <p className="text-white font-bold">{(count as bigint)?.toString() || '0'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Base Price/NFT</p>
                                <p className="text-emerald-400 font-bold">
                                    ${threshold && count ? (Number(formatUnits(threshold as bigint, 18)) / Number(count)).toFixed(2) : '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Button vs Edit Form */}
                    {!showEditMode ? (
                        <Button
                            onClick={() => setShowEditMode(true)}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl text-lg font-semibold"
                        >
                            ✏️ Update Split Settings
                        </Button>
                    ) : (
                        <>
                            {/* Info Box */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                                <p className="text-amber-400 text-sm font-semibold mb-1">ℹ️ Note</p>
                                <p className="text-slate-300 text-xs">
                                    Split threshold is fixed at <span className="text-amber-400 font-bold">${threshold ? Number(formatUnits(threshold as bigint, 18)).toFixed(0) : '200'}</span>.
                                    Only split count can be changed.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">New Split Count</label>
                                    <input
                                        type="number"
                                        value={splitCount}
                                        onChange={(e) => setSplitCount(e.target.value)}
                                        min="1"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </div>

                                {/* Preview */}
                                {!!threshold && splitCount && (
                                    <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
                                        <span className="text-slate-400">New Base Price/NFT: </span>
                                        <span className="text-yellow-400 font-bold">
                                            ${(Number(formatUnits(threshold as bigint, 18)) / Number(splitCount)).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => setShowEditMode(false)}
                                        className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateSettings}
                                        disabled={settingSplit || !splitCount}
                                        className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-semibold"
                                    >
                                        {settingSplit ? 'Updating...' : '✓ Update Split Count'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Confirmation Modal - Portal to body for proper z-index */}
                {showConfirmModal && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
                        <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ Confirm Settings Change</h3>

                            <div className="bg-slate-800 rounded-xl p-4 mb-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Split Threshold (Fixed):</span>
                                    <span className="text-amber-400 font-bold">
                                        ${threshold ? Number(formatUnits(threshold as bigint, 18)).toFixed(0) : '200'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Current → New Count:</span>
                                    <span className="text-white font-bold">
                                        {(count as bigint)?.toString() || '0'} → {splitCount}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-700 pt-3">
                                    <span className="text-slate-400">New Base Price/NFT:</span>
                                    <span className="text-yellow-400 font-bold text-lg">
                                        ${threshold ? (Number(formatUnits(threshold as bigint, 18)) / Number(splitCount)).toFixed(2) : '0'}
                                    </span>
                                </div>
                            </div>

                            <p className="text-purple-300 text-sm mb-6">
                                Confirm split count change?
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUpdateSettings}
                                    disabled={settingSplit}
                                    className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-semibold"
                                >
                                    {settingSplit ? 'Updating...' : 'Yes, Update'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {/* Queue Settings */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">📦</span>
                    Queue Settings
                </h3>

                {/* Current Value Display */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                    <p className="text-amber-400 text-sm font-semibold mb-2">📊 Current Queue Count</p>
                    <p className="text-2xl font-bold text-white">{(queueCount as bigint)?.toString() || '0'}</p>
                    <p className="text-slate-400 text-xs mt-1">Maximum unlisted NFTs per user</p>
                </div>

                {!showQueueEdit ? (
                    <Button
                        onClick={() => setShowQueueEdit(true)}
                        className="w-full bg-amber-600 hover:bg-amber-500 py-4 rounded-xl text-lg font-semibold"
                    >
                        ✏️ Update Queue Count
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">New Queue Count (1-10)</label>
                            <input
                                type="number"
                                value={queueCountInput}
                                onChange={(e) => setQueueCountInput(e.target.value)}
                                min="1"
                                max="10"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                placeholder="Enter value 1-10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => {
                                    setShowQueueEdit(false);
                                    setQueueCountInput('');
                                }}
                                className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!queueCountInput) return;
                                    const val = parseInt(queueCountInput);
                                    if (val < 1 || val > 10) {
                                        toast.error('Queue count must be 1-10');
                                        return;
                                    }
                                    updateQueueCount(BigInt(val));
                                }}
                                disabled={settingQueue || !queueCountInput}
                                className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-xl font-semibold"
                            >
                                {settingQueue ? 'Updating...' : '✓ Update'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* NFT Display Config */}
            <NFTDisplayConfigSection />

            {/* All NFTs List */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">📋</span>
                        All NFTs Inventory
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Sort: {marketplaceConfig?.defaultSort || 'newest'}</span>
                        <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                            {totalNFTs?.toString() || '0'} NFTs
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {totalNFTs && Number(totalNFTs) > 0 ? (
                        (() => {
                            const sort = marketplaceConfig?.defaultSort || 'newest';
                            const count = Number(totalNFTs);
                            let ids: number[] = [];

                            if (sort === 'newest') {
                                ids = Array.from({ length: count }, (_, i) => count - i);
                            } else if (sort === 'oldest') {
                                ids = Array.from({ length: count }, (_, i) => i + 1);
                            } else {
                                // Default to newest
                                ids = Array.from({ length: count }, (_, i) => count - i);
                            }

                            return ids.map((id) => (
                                <NFTCompactCard key={id} nftId={BigInt(id)} />
                            ));
                        })()
                    ) : (
                        <div className="col-span-full py-12 text-center bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                            <p className="text-slate-500">No NFTs minted yet. Use the form above to mint your first NFT.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NFTCompactCard({ nftId }: { nftId: bigint }) {
    const { data: nft, isLoading } = useNFT(nftId);

    if (isLoading) return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-pulse h-40">
            <div className="h-full bg-slate-900/50 rounded-lg"></div>
        </div>
    );

    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return null;

    // Updated array: [nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, isListed, isBurned]
    const [id, currentPrice, basePrice, lastPurchasePrice, ownerId, , , , isListed, isBurned] = nftData;

    // Hide burned NFTs from admin list by default
    if (isBurned) return null;

    return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <span className="text-indigo-400 font-bold">#{id.toString()}</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Price</p>
                        <p className="text-white font-bold">${Number(formatUnits(currentPrice, 18)).toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {isListed && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="For Sale" />}
                    {isBurned && <div className="w-2 h-2 bg-red-500 rounded-full" title="Burned" />}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] mb-4">
                <div className="bg-slate-900/50 p-2 rounded-lg">
                    <p className="text-slate-500">Owner</p>
                    <p className="text-white">
                        {ownerId === BigInt(0) ? (
                            <span className="text-slate-500">Contract</span>
                        ) : (
                            <OwnerUsername ownerId={ownerId} />
                        )}
                    </p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg">
                    <p className="text-slate-500">Base Price</p>
                    <p className="text-white">${Number(formatUnits(basePrice, 18)).toFixed(2)}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <span className={`flex-1 text-center text-[10px] font-bold py-2 rounded-lg ${isListed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                    {isListed ? 'Listed' : 'Not Listed'}
                </span>
                <span className={`flex-1 text-center text-[10px] font-bold py-2 rounded-lg ${isBurned ? 'bg-red-500/20 text-red-400' : 'bg-slate-900 text-slate-500'}`}>
                    {isBurned ? 'Burned' : 'Active'}
                </span>
            </div>
        </div>
    );
}

function NFTDetailsCard({ nftId }: { nftId: bigint }) {
    const { data: nft, isLoading } = useNFT(nftId);

    if (isLoading) return <div className="p-4 text-slate-500">Loading NFT Details...</div>;
    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return <div className="p-4 text-red-400 bg-red-900/20 rounded-xl border border-red-800">Invalid NFT ID or NFT not found</div>;

    // Updated nft structure: [nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, isListed, isBurned]
    const [id, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, isListed, isBurned] = nftData;

    return (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl grid md:grid-cols-2 gap-8 items-start animate-in zoom-in-95 duration-300">
            <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-slate-800 border-dashed">
                    <span className="text-4xl font-bold text-white"># {id.toString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isListed && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-800">FOR SALE</span>}
                    {isBurned && <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs font-bold rounded-full">BURNED</span>}
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <p className="text-slate-500">Owner</p>
                    <p className="text-white">
                        {ownerId === BigInt(0) ? (
                            <span className="text-slate-500">Contract</span>
                        ) : (
                            <OwnerUsername ownerId={ownerId} />
                        )}
                    </p>
                    <p className="text-slate-500">Current Price</p>
                    <p className="text-white font-bold">${Number(formatUnits(currentPrice, 18)).toFixed(2)}</p>
                    <p className="text-slate-500">Base Price</p>
                    <p className="text-white">${Number(formatUnits(basePrice, 18)).toFixed(2)}</p>
                    <p className="text-slate-500">Buy Count</p>
                    <p className="text-white">{buyCount.toString()}</p>
                    <p className="text-slate-500">Created</p>
                    <p className="text-white">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</p>
                    {lastTradedAt > 0 && (
                        <>
                            <p className="text-slate-500">Last Trade</p>
                            <p className="text-white">{new Date(Number(lastTradedAt) * 1000).toLocaleDateString()}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Marketplace Config Section - Simple
function NFTDisplayConfigSection() {
    const { config, isLoading, updateConfig } = useMarketplaceConfig();
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleUserId1 = async () => {
        setIsSaving(true);
        const success = await updateConfig({
            hideUserId1: !config.hideUserId1,
        });
        if (success) toast.success('User ID 1 filter updated!');
        else toast.error('Failed to update');
        setIsSaving(false);
    };

    const handleSortChange = async (sortId: string) => {
        setIsSaving(true);
        const success = await updateConfig({
            defaultSort: sortId
        });
        if (success) toast.success('Sort updated!');
        else toast.error('Failed to update');
        setIsSaving(false);
    };

    if (isLoading) return (
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-48"></div>
        </div>
    );

    // Toggle button component
    const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled: boolean }) => (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-pink-500' : 'bg-slate-700'} ${disabled ? 'opacity-50' : ''}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'left-7' : 'left-1'}`} />
        </button>
    );

    return (
        <div className="bg-slate-900/50 border border-pink-500/20 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-pink-500/20 text-pink-400 rounded-lg text-sm">🔧</span>
                    Marketplace Config
                </h3>
                {config.lastUpdated && (
                    <span className="text-[10px] text-slate-500">
                        Updated: {new Date(config.lastUpdated).toLocaleTimeString()}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Hide User ID 1 Toggle */}
                <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-3 rounded-lg">
                    <div className="flex-1">
                        <h4 className="text-xs font-semibold text-white mb-0.5">Hide User ID 1 (BULL1)</h4>
                        <p className="text-[10px] text-slate-400">User ID 1's NFTs won't show in marketplace</p>
                    </div>
                    <Toggle
                        checked={config.hideUserId1}
                        onChange={handleToggleUserId1}
                        disabled={isSaving}
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Default Marketplace Sort</p>
                    <select
                        value={config.defaultSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        disabled={isSaving}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                        <option value="newest">🆕 Newest First</option>
                        <option value="oldest">⏰ Oldest First</option>
                        <option value="price-low">💰 Price: Low to High</option>
                        <option value="price-high">💎 Price: High to Low</option>
                        <option value="sales-low">📊 Sales: Low to High</option>
                        <option value="sales-high">🔥 Sales: High to Low</option>
                    </select>
                    <p className="text-[10px] text-slate-400">Shuffling will continue, but this affects initial order</p>
                </div>
            </div>
        </div>
    );
}
