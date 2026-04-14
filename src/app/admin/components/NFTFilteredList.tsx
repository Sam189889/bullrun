'use client';

import React, { useMemo } from 'react';
import { useNFT } from '@/hooks/useAdminContracts';
import { formatUnits } from 'viem';

interface NFTFilteredListProps {
    totalNFTs: number;
    filterOwnerId: string;
    sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high';
    currentPage: number;
    itemsPerPage: number;
}

// NFT data type for sorting
interface NFTData {
    id: number;
    currentPrice: bigint;
    ownerId: bigint;
}

// Component to fetch and prepare NFT data for sorting
function NFTDataFetcher({ nftId, onData }: { nftId: number; onData: (data: NFTData | null) => void }) {
    const { data: nft } = useNFT(BigInt(nftId));
    
    useMemo(() => {
        if (!nft) {
            onData(null);
            return;
        }
        
        const nftData = nft as any[];
        if (!nftData || nftData[0] === BigInt(0)) {
            onData(null);
            return;
        }
        
        const [id, currentPrice, , , ownerId, , , , , isBurned] = nftData;
        
        // Skip burned NFTs
        if (isBurned) {
            onData(null);
            return;
        }
        
        onData({
            id: Number(id),
            currentPrice,
            ownerId
        });
    }, [nft, onData]);
    
    return null;
}

export function NFTFilteredList({ totalNFTs, filterOwnerId, sortBy, currentPage, itemsPerPage }: NFTFilteredListProps) {
    // Generate all NFT IDs
    const allIds = useMemo(() => {
        return Array.from({ length: totalNFTs }, (_, i) => i + 1);
    }, [totalNFTs]);
    
    // Filter by owner ID if specified
    const filteredIds = useMemo(() => {
        if (!filterOwnerId) return allIds;
        // For now, return all IDs - filtering will happen at render
        return allIds;
    }, [allIds, filterOwnerId]);
    
    // Sort IDs based on sortBy
    const sortedIds = useMemo(() => {
        let ids = [...filteredIds];
        
        switch (sortBy) {
            case 'newest':
                ids = ids.sort((a, b) => b - a);
                break;
            case 'oldest':
                ids = ids.sort((a, b) => a - b);
                break;
            case 'price-low':
            case 'price-high':
                // For price sorting, we need to fetch NFT data
                // For now, fallback to ID-based sorting
                // Price sorting will be applied at the component level
                ids = ids.sort((a, b) => b - a);
                break;
        }
        
        return ids;
    }, [filteredIds, sortBy]);
    
    // Paginate
    const paginatedIds = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedIds.slice(startIndex, endIndex);
    }, [sortedIds, currentPage, itemsPerPage]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedIds.map((id) => (
                <NFTCompactCardWithFilter 
                    key={id} 
                    nftId={BigInt(id)} 
                    filterOwnerId={filterOwnerId}
                />
            ))}
        </div>
    );
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
import { useState } from 'react';
import { useNFTControls } from '@/hooks/useNFTControls';
import { useUserInfo } from '@/hooks/useContracts';
import toast from 'react-hot-toast';

function OwnerUsername({ ownerId }: { ownerId: bigint }) {
    const { data: userInfo } = useUserInfo(ownerId);
    if (!userInfo) return <span className="text-slate-500">Loading...</span>;
    const user = userInfo as { usernameId: bigint };
    return <span className="font-mono">BULL{user.usernameId.toString()}</span>;
}

function NFTCompactCardDisplay({ nftId, nftData }: { nftId: bigint; nftData: any[] }) {
    const { hiddenNFTs, pinnedNFTs, refetch } = useNFTControls();
    const [updating, setUpdating] = useState(false);
    
    const nftIdNum = Number(nftId);
    const isHidden = hiddenNFTs.includes(nftIdNum);
    const isPinned = pinnedNFTs.some(p => p.nft_id === nftIdNum);
    
    const toggleHide = async () => {
        setUpdating(true);
        try {
            await fetch(`/api/admin/nft-controls/${nftIdNum}/hide`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: !isHidden })
            });
            toast.success(isHidden ? 'NFT unhidden' : 'NFT hidden');
            refetch();
        } catch {
            toast.error('Failed');
        } finally {
            setUpdating(false);
        }
    };
    
    const togglePin = async () => {
        setUpdating(true);
        try {
            await fetch(`/api/admin/nft-controls/${nftIdNum}/pin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_pinned: !isPinned, pin_order: isPinned ? 0 : 1 })
            });
            toast.success(isPinned ? 'NFT unpinned' : 'NFT pinned');
            refetch();
        } catch {
            toast.error('Failed');
        } finally {
            setUpdating(false);
        }
    };
    
    const [id, currentPrice, basePrice, , ownerId, , , , isListed, isBurned] = nftData;
    
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
                    onClick={toggleHide}
                    disabled={updating}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded ${isHidden ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'} hover:opacity-80 disabled:opacity-50`}
                >
                    {isHidden ? '🔒 Hidden' : '👁️ Visible'}
                </button>
                <button
                    onClick={togglePin}
                    disabled={updating}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded ${isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400'} hover:opacity-80 disabled:opacity-50`}
                >
                    {isPinned ? '⭐ Pinned' : '📌 Pin'}
                </button>
            </div>
        </div>
    );
}
