'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import {
    useTotalNFTs,
    useNFTSplitThreshold,
    useNFTSplitCount,
    useNFTAppreciationBps,
    useCreateNFT,
    useSetSplitCount
} from '@/hooks/useAdminContracts';

import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

// MySQL-based components
import { QueueRulesSection } from './QueueRulesSection';
import { NFTTabsSection } from './NFTTabsSection';
import { AdminControlsSection } from './AdminControlsSection';

export function NFTsTab() {
    const [basePrice, setBasePrice] = useState('10');
    const [nftCount, setNftCount] = useState('1');
    const [splitCount, setSplitCount] = useState('2');
    const [selectedNftId, setSelectedNftId] = useState<string>('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showEditMode, setShowEditMode] = useState(false);
    const [showCreateMode, setShowCreateMode] = useState(false);

    // Reads - add refetch for all
    const { data: totalNFTs, refetch: refetchTotalNFTs } = useTotalNFTs();
    const { data: threshold, refetch: refetchThreshold } = useNFTSplitThreshold();
    const { data: count, refetch: refetchCount } = useNFTSplitCount();
    const { data: appreciation, refetch: refetchAppreciation } = useNFTAppreciationBps();

    // Writes - get isSuccess to know when tx is confirmed
    const { createNFT, isPending: creating, isConfirming: creatingConfirming, isSuccess: createSuccess } = useCreateNFT();
    const { setSplitCount: updateSplitCount, isPending: settingSplit, isSuccess: settingsSuccess } = useSetSplitCount();

    // Refetch all data function
    const refetchAll = () => {
        refetchTotalNFTs();
        refetchThreshold();
        refetchCount();
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            {/* ========================================= */}
            {/*  QUEUE RULES MANAGEMENT (MySQL Data)     */}
            {/* ========================================= */}
            <QueueRulesSection />

            {/* ========================================= */}
            {/*  NFT DISPLAY WITH TABS (MySQL Data)      */}
            {/* ========================================= */}
            <NFTTabsSection />

            {/* ========================================= */}
            {/*  ADMIN CONTROLS (Feature Toggles)        */}
            {/* ========================================= */}
            <AdminControlsSection />

            {/* Divider */}
            <div className="border-t border-slate-800 my-12" />

            {/* ========================================= */}
            {/*  CONTRACT SETTINGS (Blockchain)          */}
            {/* ========================================= */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">⚙️</span>
                    Contract Settings & Blockchain NFT Creation
                </h2>

                {/* Contract Stats Overview */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Create NFT Form */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">➕</span>
                        Create New NFT
                    </h3>
                    
                    {!showCreateMode ? (
                        <Button
                            onClick={() => setShowCreateMode(true)}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-lg font-semibold"
                        >
                            ➕ Create NFT on Blockchain
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Base Price (USD)
                                    </label>
                                    <input
                                        type="text"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        placeholder="10"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Number of NFTs (1-50)
                                    </label>
                                    <input
                                        type="number"
                                        value={nftCount}
                                        onChange={(e) => setNftCount(e.target.value)}
                                        min="1"
                                        max="50"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCreateNFT}
                                    disabled={creating || !basePrice}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                                >
                                    {creating ? 'Creating...' : 'Create NFT'}
                                </Button>
                                <Button
                                    onClick={() => setShowCreateMode(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Editor */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">⚙️</span>
                        NFT Settings
                    </h3>
                    
                    {!showEditMode ? (
                        <Button
                            onClick={() => setShowEditMode(true)}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl text-lg font-semibold"
                        >
                            ⚙️ Edit Settings
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Split Count
                                </label>
                                <input
                                    type="number"
                                    value={splitCount}
                                    onChange={(e) => setSplitCount(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpdateSettings}
                                    disabled={settingSplit}
                                    className="flex-1 bg-purple-600 hover:bg-purple-500"
                                >
                                    {settingSplit ? 'Updating...' : 'Update'}
                                </Button>
                                <Button
                                    onClick={() => setShowEditMode(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                </div>

            </div>
            {/* End Contract Settings wrapper */}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm Settings Update</h3>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to update the split count to <span className="text-purple-400 font-bold">{splitCount}</span>?
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={confirmUpdateSettings}
                                disabled={settingSplit}
                                className="flex-1 bg-purple-600 hover:bg-purple-500"
                            >
                                {settingSplit ? 'Updating...' : 'Confirm'}
                            </Button>
                            <Button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
