'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
import {
    useTotalNFTs,
    useNFT,
    useNFTSplitThreshold,
    useNFTSplitCount,
    useNFTAppreciationBps,
    useCreateNFT,
    useSetSplitSettings,
    useToggleNFTFeatured,
    useToggleNFTHidden,
    useSetNFTDisplayOrder
} from '@/hooks/useAdminContracts';
import { useUserInfo } from '@/hooks/useContracts';
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
    const [splitThreshold, setSplitThreshold] = useState('100');
    const [splitCount, setSplitCount] = useState('2');
    const [selectedNftId, setSelectedNftId] = useState<string>('');

    // Reads
    const { data: totalNFTs } = useTotalNFTs();
    const { data: threshold } = useNFTSplitThreshold();
    const { data: count } = useNFTSplitCount();
    const { data: appreciation } = useNFTAppreciationBps();

    // Writes
    const { createNFT, isPending: creating } = useCreateNFT();
    const { setSplitSettings, isPending: settingSplit } = useSetSplitSettings();
    const { toggleFeatured, isPending: togglingFeatured } = useToggleNFTFeatured();
    const { toggleHidden, isPending: togglingHidden } = useToggleNFTHidden();
    const { setOrder, isPending: settingOrder } = useSetNFTDisplayOrder();

    const handleCreateNFT = async () => {
        try {
            await createNFT(basePrice);
            toast.success('NFT Creation Transaction Sent');
        } catch (err) {
            toast.error('Failed to create NFT');
        }
    };

    const handleUpdateSettings = async () => {
        try {
            await setSplitSettings(splitThreshold, BigInt(splitCount));
            toast.success('Split Settings Update Sent');
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
                    <p className="text-2xl font-bold text-white">${threshold ? formatUnits(threshold as bigint, 18) : '0'}</p>
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
                    <div className="space-y-4">
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
                        <Button
                            onClick={handleCreateNFT}
                            disabled={creating}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-xl text-lg font-semibold shadow-lg shadow-blue-900/20"
                        >
                            {creating ? 'Creating...' : 'Mint NFT'}
                        </Button>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">⚙️</span>
                        Split Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Threshold ($)</label>
                                <input
                                    type="number"
                                    value={splitThreshold}
                                    onChange={(e) => setSplitThreshold(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Split Count</label>
                                <input
                                    type="number"
                                    value={splitCount}
                                    onChange={(e) => setSplitCount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleUpdateSettings}
                            disabled={settingSplit}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-6 rounded-xl text-lg font-semibold shadow-lg shadow-purple-900/20"
                        >
                            {settingSplit ? 'Updating...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions for Individual NFT */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">🖼️</span>
                    NFT Quick Management
                </h3>
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="number"
                            value={selectedNftId}
                            onChange={(e) => setSelectedNftId(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="Enter NFT ID (e.g. 1)"
                        />
                    </div>

                    {selectedNftId && selectedNftId.trim() !== '' && (
                        <NFTDetailsCard nftId={BigInt(selectedNftId)} />
                    )}
                </div>
            </div>

            {/* All NFTs List */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">📋</span>
                        All NFTs Inventory
                    </h3>
                    <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                        Showing all {totalNFTs?.toString() || '0'} NFTs
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {totalNFTs && Number(totalNFTs) > 0 ? (
                        Array.from({ length: Number(totalNFTs) }).map((_, i) => (
                            <NFTCompactCard key={i} nftId={BigInt(i + 1)} />
                        ))
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
    const { toggleFeatured, isPending: togglingFeatured } = useToggleNFTFeatured();
    const { toggleHidden, isPending: togglingHidden } = useToggleNFTHidden();

    if (isLoading) return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-pulse h-40">
            <div className="h-full bg-slate-900/50 rounded-lg"></div>
        </div>
    );

    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return null;

    // Correct array: [nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, displayOrder, isListed, isBurned, isFeatured, isHidden]
    const [id, currentPrice, basePrice, lastPurchasePrice, ownerId, , , , , isListed, isBurned, isFeatured, isHidden] = nftData;

    return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <span className="text-indigo-400 font-bold">#{id.toString()}</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Price</p>
                        <p className="text-white font-bold">${formatUnits(currentPrice, 18)}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {isFeatured && <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="Featured" />}
                    {isHidden && <div className="w-2 h-2 bg-red-500 rounded-full" title="Hidden" />}
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
                    <p className="text-white">${formatUnits(basePrice, 18)}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => toggleFeatured(id)}
                    disabled={togglingFeatured}
                    className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-colors ${isFeatured ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                >
                    {isFeatured ? 'Featured' : 'Feature'}
                </button>
                <button
                    onClick={() => toggleHidden(id)}
                    disabled={togglingHidden}
                    className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-colors ${isHidden ? 'bg-red-500/20 text-red-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                >
                    {isHidden ? 'Hidden' : 'Hide'}
                </button>
            </div>
        </div>
    );
}

function NFTDetailsCard({ nftId }: { nftId: bigint }) {
    const { data: nft, isLoading } = useNFT(nftId);
    const { toggleFeatured, isPending: togglingFeatured } = useToggleNFTFeatured();
    const { toggleHidden, isPending: togglingHidden } = useToggleNFTHidden();

    if (isLoading) return <div className="p-4 text-slate-500">Loading NFT Details...</div>;
    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return <div className="p-4 text-red-400 bg-red-900/20 rounded-xl border border-red-800">Invalid NFT ID or NFT not found</div>;

    // nft structure from ABI: 
    // [nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, displayOrder, isListed, isBurned, isFeatured, isHidden]
    const [id, currentPrice, basePrice, lastPurchasePrice, ownerId, buyCount, createdAt, lastTradedAt, displayOrder, isListed, isBurned, isFeatured, isHidden] = nftData;

    return (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl grid md:grid-cols-2 gap-8 items-start animate-in zoom-in-95 duration-300">
            <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-slate-800 border-dashed">
                    <span className="text-4xl font-bold text-white"># {id.toString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isFeatured && <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-800">FEATURED</span>}
                    {isHidden && <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-800">HIDDEN</span>}
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
                    <p className="text-white font-bold">${formatUnits(currentPrice, 18)}</p>
                    <p className="text-slate-500">Base Price</p>
                    <p className="text-white">${formatUnits(basePrice, 18)}</p>
                    <p className="text-slate-500">Buy Count</p>
                    <p className="text-white">{buyCount.toString()}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleFeatured(id)}
                        disabled={togglingFeatured}
                        className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border-amber-600/50"
                    >
                        {isFeatured ? 'Un-Feature' : 'Set Featured'}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleHidden(id)}
                        disabled={togglingHidden}
                        className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border-red-600/50"
                    >
                        {isHidden ? 'Un-Hide' : 'Hide NFT'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
