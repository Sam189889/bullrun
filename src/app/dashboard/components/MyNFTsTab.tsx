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

function OwnedNFTCard({ nftId, isOwned }: { nftId: number; isOwned: boolean }) {
    const { data: nftData, isLoading } = useNFT(BigInt(nftId));

    if (isLoading) {
        return (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 animate-pulse">
                <div className="h-20 bg-[#0F172A] rounded-lg mb-3"></div>
                <div className="h-4 bg-[#0F172A] rounded w-1/2"></div>
            </div>
        );
    }

    if (!nftData) return null;

    // Parse array format from Solidity struct (ABI confirms all fields are returned)
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

    // Skip if not owned by user
    if (!isOwned) return null;

    const formatUSD = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] hover:border-[#EC4899]/50 transition-all group">
            {/* Featured/Status Badges */}
            <div className="absolute top-2 right-2 flex gap-1">
                {nft.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#F59E0B]/30 text-[#F59E0B] border border-[#F59E0B]/50">
                        ⭐ HOT
                    </span>
                )}
                {nft.isListed && (
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50">
                        Listed
                    </span>
                )}
            </div>

            {/* NFT Visual */}
            <div className="h-24 sm:h-32 bg-gradient-to-br from-[#EC4899]/10 via-[#0F172A] to-[#D946EF]/10 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#EC4899]/20 to-[#D946EF]/20 blur-xl" />
                </div>
                <span className="relative text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                    🪙
                </span>
            </div>

            {/* NFT Info */}
            <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-[10px] text-[#64748B] font-mono">NFT #{nftId}</p>
                        <p className="text-[10px] text-[#475569]">{Number(nft.buyCount)} trades</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-[#64748B]">Value</p>
                        <p className="text-sm sm:text-base font-bold text-[#10B981]">{formatUSD(nft.currentPrice)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                    <div className="bg-[#0F172A] rounded-lg p-2">
                        <p className="text-[#64748B]">Base Price</p>
                        <p className="text-white font-bold">{formatUSD(nft.basePrice)}</p>
                    </div>
                    <div className="bg-[#0F172A] rounded-lg p-2">
                        <p className="text-[#64748B]">Profit</p>
                        <p className="text-[#10B981] font-bold">
                            +{formatUSD(nft.currentPrice - nft.basePrice)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
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

            {/* NFT Grid - Filter by ownership */}
            {nftCount === 0 ? (
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] p-12 text-center">
                    <p className="text-5xl mb-4">📭</p>
                    <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">No NFTs Yet</h3>
                    <p className="text-sm text-[#64748B]">Buy your first NFT from the Trade tab!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {nftIds.map((id) => (
                        <NFTOwnershipChecker key={id} nftId={id} userId={userId as bigint} />
                    ))}
                </div>
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

// Helper component to check ownership and render if owned
function NFTOwnershipChecker({ nftId, userId }: { nftId: number; userId: bigint }) {
    const { data: nftData } = useNFT(BigInt(nftId));

    if (!nftData) {
        return null;
    }

    // Parse array - ABI confirms all fields including nftId are returned
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

    const ownerId = nftArray[4]; // Index 4 is ownerId
    const isOwned = ownerId === userId;

    if (!isOwned) return null;

    return <OwnedNFTCard nftId={nftId} isOwned={true} />;
}
