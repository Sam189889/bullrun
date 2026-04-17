'use client';

import React, { useMemo } from 'react';
import { useNFT } from '@/hooks/useAdminContracts';
import { formatUnits } from 'viem';

interface NFTFilteredListProps {
    totalNFTs: number;
    filterOwnerId: string;
    sortBy: 'newest' | 'oldest' | 'recently-traded';
    currentPage: number;
    itemsPerPage: number;
    excludeHidden?: number[];
    excludePinned?: number[];
    isBulkMode?: boolean;
    selectedNFTs?: Set<number>;
    onToggleSelection?: (nftId: number) => void;
}


export function NFTFilteredList({ 
    totalNFTs, 
    filterOwnerId, 
    sortBy, 
    currentPage, 
    itemsPerPage, 
    excludeHidden = [], 
    excludePinned = [],
    isBulkMode = false,
    selectedNFTs = new Set(),
    onToggleSelection
}: NFTFilteredListProps) {
    // Import useNFTControls here to get controls data
    const { hiddenNFTs, pinnedNFTs, refetch } = require('@/hooks/useNFTControls').useNFTControls();
    
    // Generate all NFT IDs and exclude controlled ones
    const allIds = useMemo(() => {
        const ids = Array.from({ length: totalNFTs }, (_, i) => i + 1);
        const pinnedIds = excludePinned;
        return ids.filter(id => !excludeHidden.includes(id) && !pinnedIds.includes(id));
    }, [totalNFTs, excludeHidden, excludePinned]);
    
    // Filter by owner ID if specified
    const filteredIds = useMemo(() => {
        if (!filterOwnerId) return allIds;
        // For now, return all IDs - filtering will happen at render
        return allIds;
    }, [allIds, filterOwnerId]);
    
    // Sort IDs based on sortBy (for simple sorts only)
    const sortedIds = useMemo(() => {
        if (sortBy === 'recently-traded') return filteredIds; // Skip for recently-traded
        
        let ids = [...filteredIds];
        
        switch (sortBy) {
            case 'newest':
                ids = ids.sort((a, b) => b - a);
                break;
            case 'oldest':
                ids = ids.sort((a, b) => a - b);
                break;
        }
        
        return ids;
    }, [filteredIds, sortBy]);
    
    // Paginate (for simple sorts only)
    const paginatedIds = useMemo(() => {
        if (sortBy === 'recently-traded') return []; // Skip for recently-traded
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedIds.slice(startIndex, endIndex);
    }, [sortedIds, currentPage, itemsPerPage, sortBy]);
    
    // Conditional rendering instead of conditional return
    if (sortBy === 'recently-traded') {
        return (
            <NFTControlsContext.Provider value={{ 
                hiddenNFTs, 
                pinnedNFTs, 
                refetch, 
                isBulkMode, 
                selectedNFTs, 
                onToggleSelection 
            }}>
                <RecentlyTradedList 
                    allIds={filteredIds} 
                    filterOwnerId={filterOwnerId}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                />
            </NFTControlsContext.Provider>
        );
    }
    
    return (
        <NFTControlsContext.Provider value={{ 
            hiddenNFTs, 
            pinnedNFTs, 
            refetch, 
            isBulkMode, 
            selectedNFTs, 
            onToggleSelection 
        }}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedIds.map((id) => (
                    <NFTCompactCardWithFilter 
                        key={id} 
                        nftId={BigInt(id)} 
                        filterOwnerId={filterOwnerId}
                    />
                ))}
            </div>
        </NFTControlsContext.Provider>
    );
}

// Component for recently-traded sorting using contract data
function RecentlyTradedList({ allIds, filterOwnerId, currentPage, itemsPerPage }: { 
    allIds: number[];
    filterOwnerId: string;
    currentPage: number;
    itemsPerPage: number;
}) {
    // Get ALL NFT IDs for accurate recently-traded sorting
    // We need to check all NFTs to see which were traded most recently
    const latestIds = useMemo(() => {
        // Take all IDs in reverse order (start with highest)
        return [...allIds].reverse();
    }, [allIds]);
    
    // Use data fetcher to collect and sort
    return <RecentlyTradedDataFetcher 
        nftIds={latestIds}
        filterOwnerId={filterOwnerId}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
    />;
}

// Fetcher component that collects NFT data
function RecentlyTradedDataFetcher({ nftIds, filterOwnerId, currentPage, itemsPerPage }: {
    nftIds: number[];
    filterOwnerId: string;
    currentPage: number;
    itemsPerPage: number;
}) {
    const [nftData, setNftData] = React.useState<Map<number, bigint>>(new Map());
    const [fetchedCount, setFetchedCount] = React.useState(0);
    
    // Collect NFT data as components mount
    const collectNFTData = React.useCallback((id: number, lastTradedAt: bigint) => {
        setNftData(prev => {
            const newMap = new Map(prev);
            newMap.set(id, lastTradedAt);
            return newMap;
        });
        setFetchedCount(prev => prev + 1);
    }, []);
    
    // Sort NFTs by lastTradedAt once we have data
    const sortedIds = useMemo(() => {
        if (nftData.size === 0) return nftIds;
        
        const idsWithData = Array.from(nftData.entries())
            .sort((a, b) => Number(b[1] - a[1])) // Sort by lastTradedAt descending
            .map(([id]) => id);
        
        // Add any missing IDs at the end
        const missingIds = nftIds.filter(id => !nftData.has(id));
        return [...idsWithData, ...missingIds];
    }, [nftData, nftIds]);
    
    const paginatedIds = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedIds.slice(startIndex, endIndex);
    }, [sortedIds, currentPage, itemsPerPage]);
    
    // Show loading until we have enough data for first page or all data is fetched
    const minRequiredForDisplay = Math.min(itemsPerPage * 2, nftIds.length);
    const isLoading = fetchedCount < minRequiredForDisplay;
    
    return (
        <>
            {/* Hidden fetchers to collect data from ALL NFTs for accurate sorting */}
            {nftIds.map(id => (
                <NFTDataCollector 
                    key={`collector-${id}`}
                    nftId={id}
                    onData={collectNFTData}
                />
            ))}
            
            {/* Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading && (
                    Array.from({ length: Math.min(itemsPerPage, 10) }).map((_, i) => (
                        <div key={`loading-${i}`} className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-pulse h-48">
                            <div className="h-full bg-slate-900/50 rounded-lg"></div>
                        </div>
                    ))
                )}
                
                {!isLoading && paginatedIds.map((id) => (
                    <NFTCompactCardWithRecentlyTradedSort 
                        key={id} 
                        nftId={BigInt(id)} 
                        filterOwnerId={filterOwnerId}
                    />
                ))}
            </div>
        </>
    );
}

// Hidden component that fetches and reports NFT data
function NFTDataCollector({ nftId, onData }: { nftId: number; onData: (id: number, lastTradedAt: bigint) => void }) {
    const { data: nft } = useNFT(BigInt(nftId));
    
    React.useEffect(() => {
        if (!nft) return;
        
        const nftData = nft as any[];
        if (!nftData || nftData[0] === BigInt(0)) return;
        
        const [, , , , , , , lastTradedAt, , isBurned] = nftData;
        if (isBurned) return;
        
        onData(nftId, lastTradedAt as bigint);
    }, [nft, nftId, onData]);
    
    return null;
}

// Specialized wrapper that shows lastTradedAt prominently for recently-traded view
function NFTCompactCardWithRecentlyTradedSort({ nftId, filterOwnerId }: { nftId: bigint; filterOwnerId: string }) {
    const { data: nft, isLoading } = useNFT(nftId);
    
    if (isLoading) return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-pulse h-40">
            <div className="h-full bg-slate-900/50 rounded-lg"></div>
        </div>
    );
    
    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return null;
    
    const [, , , , ownerId, , , , , isBurned] = nftData;
    
    // Hide burned NFTs
    if (isBurned) return null;
    
    // Filter by owner if specified
    if (filterOwnerId && Number(ownerId) !== parseInt(filterOwnerId)) {
        return null;
    }
    
    // Render actual card
    return <NFTCompactCardDisplay nftId={nftId} nftData={nftData} />;
}

// Wrapper component that filters by owner
function NFTCompactCardWithFilter({ nftId, filterOwnerId }: { nftId: bigint; filterOwnerId: string }) {
    const { data: nft, isLoading } = useNFT(nftId);
    
    if (isLoading) return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-pulse h-40">
            <div className="h-full bg-slate-900/50 rounded-lg"></div>
        </div>
    );
    
    const nftData = nft as any[] | undefined;
    if (!nftData || nftData[0] === BigInt(0)) return null;
    
    const [, , , , ownerId, , , , , isBurned] = nftData;
    
    // Hide burned NFTs
    if (isBurned) return null;
    
    // Filter by owner if specified
    if (filterOwnerId && Number(ownerId) !== parseInt(filterOwnerId)) {
        return null;
    }
    
    // Import and render actual card
    return <NFTCompactCardDisplay nftId={nftId} nftData={nftData} />;
}

// Display component (reusing existing NFTCompactCard logic)
import { useState, createContext, useContext } from 'react';
import { useUserInfo } from '@/hooks/useContracts';
import toast from 'react-hot-toast';

// Context for sharing controls data
type NFTControlsContextType = {
    hiddenNFTs: number[];
    pinnedNFTs: { nft_id: number; pin_order: number }[];
    refetch: () => void;
    isBulkMode: boolean;
    selectedNFTs: Set<number>;
    onToggleSelection?: (nftId: number) => void;
};

const NFTControlsContext = createContext<NFTControlsContextType | null>(null);

function useNFTControlsContext() {
    const context = useContext(NFTControlsContext);
    if (!context) {
        return { 
            hiddenNFTs: [], 
            pinnedNFTs: [], 
            refetch: () => {},
            isBulkMode: false,
            selectedNFTs: new Set<number>(),
            onToggleSelection: undefined
        };
    }
    return context;
}

function OwnerUsername({ ownerId }: { ownerId: bigint }) {
    const { data: userInfo } = useUserInfo(ownerId);
    if (!userInfo) return <span className="text-slate-500">Loading...</span>;
    const user = userInfo as { usernameId: bigint };
    return <span className="font-mono">BULL{user.usernameId.toString()}</span>;
}

function NFTCompactCardDisplay({ nftId, nftData }: { nftId: bigint; nftData: any[] }) {
    const { hiddenNFTs, pinnedNFTs, refetch, isBulkMode, selectedNFTs, onToggleSelection } = useNFTControlsContext();
    const [updating, setUpdating] = useState(false);
    
    const nftIdNum = Number(nftId);
    const isHidden = hiddenNFTs.includes(nftIdNum);
    const isPinned = pinnedNFTs.some(p => p.nft_id === nftIdNum);
    const isSelected = selectedNFTs.has(nftIdNum);
    
    const toggleHide = async () => {
        setUpdating(true);
        try {
            const res = await fetch('/api/nft-controls/hide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nft_id: nftIdNum, hidden: !isHidden })
            });
            
            if (res.ok) {
                // Reload immediately
                window.location.reload();
            } else {
                toast.error('Failed to update');
                setUpdating(false);
            }
        } catch (error) {
            toast.error('Error updating NFT');
            setUpdating(false);
        }
    };
    
    const togglePin = async () => {
        setUpdating(true);
        try {
            const res = await fetch('/api/nft-controls/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nft_id: nftIdNum, pinned: !isPinned, pin_order: isPinned ? 0 : 1 })
            });
            
            if (res.ok) {
                // Reload immediately
                window.location.reload();
            } else {
                toast.error('Failed to update');
                setUpdating(false);
            }
        } catch (error) {
            toast.error('Error updating NFT');
            setUpdating(false);
        }
    };
    
    const [id, currentPrice, basePrice, , ownerId, , , lastTradedAt, isListed, isBurned] = nftData;
    
    // Format timestamp to actual date/time
    const formatTimestamp = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    
    return (
        <div 
            className={`relative bg-slate-950 border p-4 rounded-xl transition-all group ${
                isSelected ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-slate-800 hover:border-slate-700'
            } ${isBulkMode ? 'cursor-pointer' : ''}`}
            onClick={() => {
                if (isBulkMode && onToggleSelection) {
                    onToggleSelection(nftIdNum);
                }
            }}
        >
            {/* Bulk Mode Checkbox Overlay */}
            {isBulkMode && (
                <div className="absolute top-2 right-2 z-10">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected 
                            ? 'bg-green-500 border-green-500' 
                            : 'bg-slate-900 border-slate-600'
                    }`}>
                        {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                </div>
            )}
            
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
                    {!isBulkMode && (
                        <>
                            {isListed && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="For Sale" />}
                            {isBurned && <div className="w-2 h-2 bg-red-500 rounded-full" title="Burned" />}
                        </>
                    )}
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
            
            <div className="bg-slate-900/50 p-2 rounded-lg mb-4">
                <p className="text-slate-500 text-[10px]">Last Traded</p>
                <p className="text-amber-400 text-xs font-mono">{formatTimestamp(lastTradedAt)}</p>
            </div>
            
            {!isBulkMode && (
                <>
                    <div className="flex gap-2 mb-2">
                        <span className={`flex-1 text-center text-[10px] font-bold py-2 rounded-lg ${isListed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                            {isListed ? 'Listed' : 'Not Listed'}
                        </span>
                        <span className={`flex-1 text-center text-[10px] font-bold py-2 rounded-lg ${isBurned ? 'bg-red-500/20 text-red-400' : 'bg-slate-900 text-slate-500'}`}>
                            {isBurned ? 'Burned' : 'Active'}
                        </span>
                    </div>
                    
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleHide();
                            }}
                            disabled={updating}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded ${isHidden ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'} hover:opacity-80 disabled:opacity-50`}
                        >
                            {isHidden ? '🔒 Hidden' : '👁️ Visible'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePin();
                            }}
                            disabled={updating}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded ${isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400'} hover:opacity-80 disabled:opacity-50`}
                        >
                            {isPinned ? '⭐ Pinned' : '📌 Pin'}
                        </button>
                    </div>
                </>
            )}
            
            {isBulkMode && (
                <div className="text-center py-2">
                    <p className="text-xs text-slate-400">Click to {isSelected ? 'deselect' : 'select'}</p>
                </div>
            )}
        </div>
    );
}
