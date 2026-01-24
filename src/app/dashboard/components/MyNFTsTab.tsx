'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useTotalNFTs, useNFT, useUserInfo } from '@/hooks/useContracts';

// Helper component to display owner username
function OwnerUsername({ ownerId }: { ownerId: bigint }) {
    const { data: userInfo } = useUserInfo(ownerId);
    
    if (!userInfo) return <span className="text-[#64748B]">...</span>;
    
    // Wagmi returns struct as object with named fields
    const user = userInfo as { usernameId: bigint };
    
    return <span className="font-mono text-[#EC4899]">BULL{user.usernameId.toString()}</span>;
}

interface NFTData {
    nftId: bigint;
    currentPrice: bigint;
    basePrice: bigint;
    lastPurchasePrice: bigint;
    ownerId: bigint;
    buyCount: bigint;
    createdAt: bigint;
    lastTradedAt: bigint;
    displayOrder: bigint;
    isListed: boolean;
    isBurned: boolean;
    isFeatured: boolean;
    isHidden: boolean;
}

// Mobile Card Component
function NFTMobileCard({ nftId, userId }: { nftId: number; userId: bigint }) {
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData) return null;

    const nftArray = nftData as unknown as readonly [
        bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean, boolean, boolean
    ];

    const ownerId = nftArray[4];
    if (ownerId !== userId) return null;

    const nft: NFTData = {
        nftId: nftArray[0],
        currentPrice: nftArray[1],
        basePrice: nftArray[2],
        lastPurchasePrice: nftArray[3],
        ownerId: nftArray[4],
        buyCount: nftArray[5],
        createdAt: nftArray[6],
        lastTradedAt: nftArray[7],
        displayOrder: nftArray[8],
        isListed: nftArray[9],
        isBurned: nftArray[10],
        isFeatured: nftArray[11],
        isHidden: nftArray[12],
    };

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;
    const profit = nft.currentPrice - nft.basePrice;
    const profitPercent = nft.basePrice > BigInt(0) 
        ? ((Number(profit) / Number(nft.basePrice)) * 100).toFixed(1)
        : '0';

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="font-mono text-lg text-[#EC4899] font-bold">#{nftId}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    {nft.isListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50">
                            📦 Queue
                        </span>
                    )}
                    {nft.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50">
                            ⭐ Featured
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Current Value</p>
                    <p className="text-sm font-bold text-[#10B981]">{formatUSD(nft.currentPrice)}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Profit</p>
                    <p className={`text-sm font-bold ${profit >= BigInt(0) ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {profit >= BigInt(0) ? '+' : ''}{formatUSD(profit)}
                    </p>
                    <p className="text-[8px] text-[#64748B]">{profit >= BigInt(0) ? '+' : ''}{profitPercent}%</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Base Price</p>
                    <p className="text-sm text-[#94A3B8]">{formatUSD(nft.basePrice)}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-2">
                    <p className="text-[10px] text-[#64748B] mb-1">Purchase Price</p>
                    <p className="text-sm text-[#94A3B8]">{formatUSD(nft.lastPurchasePrice)}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#334155]">
                <span className="text-xs text-[#64748B]">{Number(nft.buyCount)} trades</span>
            </div>
        </div>
    );
}

// Desktop Table Row Component
function NFTTableRow({ nftId, userId }: { nftId: number; userId: bigint }) {
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData) return null;

    // Parse array format from Solidity struct
    const nftArray = nftData as unknown as readonly [
        bigint, // nftId [0]
        bigint, // currentPrice [1]
        bigint, // basePrice [2]
        bigint, // lastPurchasePrice [3]
        bigint, // ownerId [4]
        bigint, // buyCount [5]
        bigint, // createdAt [6]
        bigint, // lastTradedAt [7]
        bigint, // displayOrder [8]
        boolean, // isListed [9]
        boolean, // isBurned [10]
        boolean, // isFeatured [11]
        boolean  // isHidden [12]
    ];

    const ownerId = nftArray[4];
    
    // Skip if not owned by user
    if (ownerId !== userId) return null;

    const nft: NFTData = {
        nftId: nftArray[0],
        currentPrice: nftArray[1],
        basePrice: nftArray[2],
        lastPurchasePrice: nftArray[3],
        ownerId: nftArray[4],
        buyCount: nftArray[5],
        createdAt: nftArray[6],
        lastTradedAt: nftArray[7],
        displayOrder: nftArray[8],
        isListed: nftArray[9],
        isBurned: nftArray[10],
        isFeatured: nftArray[11],
        isHidden: nftArray[12],
    };

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;
    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const profit = nft.currentPrice - nft.basePrice;
    const profitPercent = nft.basePrice > BigInt(0) 
        ? ((Number(profit) / Number(nft.basePrice)) * 100).toFixed(1)
        : '0';

    return (
        <tr className="border-b border-[#334155] hover:bg-[#1E293B]/50 transition-colors">
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="font-mono text-sm text-[#EC4899] font-bold">#{nftId}</span>
                </div>
            </td>
            <td className="p-3">
                <div className="flex flex-col gap-1">
                    {nft.isListed ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 w-fit">
                            🟢 Listed
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50 w-fit">
                            📦 Queue
                        </span>
                    )}
                    {nft.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 w-fit">
                            ⭐ Featured
                        </span>
                    )}
                </div>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm font-bold text-[#10B981]">{formatUSD(nft.currentPrice)}</span>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm text-[#94A3B8]">{formatUSD(nft.basePrice)}</span>
            </td>
            <td className="p-3 text-right">
                <span className="text-sm text-[#94A3B8]">{formatUSD(nft.lastPurchasePrice)}</span>
            </td>
            <td className="p-3 text-right">
                <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${profit >= BigInt(0) ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {profit >= BigInt(0) ? '+' : ''}{formatUSD(profit)}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                        {profit >= BigInt(0) ? '+' : ''}{profitPercent}%
                    </span>
                </div>
            </td>
            <td className="p-3 text-center">
                <span className="text-sm text-[#94A3B8]">{Number(nft.buyCount)}</span>
            </td>
            <td className="p-3 text-center hidden md:table-cell">
                <span className="text-xs text-[#64748B]">{formatDate(nft.createdAt)}</span>
            </td>
        </tr>
    );
}

export function MyNFTsTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: totalNFTs } = useTotalNFTs();

    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);
    const nftCount = Number(totalNFTs || 0);

    // We'll iterate through all NFTs and filter by ownerId === userId
    const nftIds = Array.from({ length: nftCount }, (_, i) => i + 1);

    if (!isRegistered) {
        return (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center animate-slide-up">
                <p className="text-5xl mb-4">🪙</p>
                <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Your NFT Portfolio</h3>
                <p className="text-[#64748B]">Connect wallet to view your owned NFTs</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                        🪙 My NFTs
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">Your personal NFT portfolio</p>
                </div>
            </div>

            {/* NFT Display - Cards on mobile, Table on desktop */}
            {nftCount === 0 ? (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center">
                    <p className="text-5xl mb-4">📭</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">No NFTs Yet</h3>
                    <p className="text-sm text-[#64748B]">Buy your first NFT from the Trade tab!</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {nftIds.map((id) => (
                            <NFTMobileCard key={id} nftId={id} userId={userId as bigint} />
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#1E293B] border-b border-[#334155]">
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">NFT ID</th>
                                    <th className="text-left p-3 text-xs font-bold text-[#94A3B8]">Status</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Current Value</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Base Price</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Purchase Price</th>
                                    <th className="text-right p-3 text-xs font-bold text-[#94A3B8]">Profit</th>
                                    <th className="text-center p-3 text-xs font-bold text-[#94A3B8]">Trades</th>
                                    <th className="text-center p-3 text-xs font-bold text-[#94A3B8]">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nftIds.map((id) => (
                                    <NFTTableRow key={id} nftId={id} userId={userId as bigint} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Info */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#10B981]/20 to-[#1E293B] border border-[#10B981]/30 rounded-xl p-3 sm:p-4 animate-slide-up">
                <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-2xl sm:text-3xl opacity-20">💡</div>
                <p className="text-[10px] sm:text-sm text-[#10B981]">
                    <strong>💡 Pro Tip:</strong> Your NFTs appreciate <span className="text-[#EC4899] font-bold">8%</span> every time they're traded. Hold to grow your portfolio value!
                </p>
            </div>
        </div>
    );
}

