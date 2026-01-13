'use client';

import { mockNFTs } from '@/lib/mockData';

export function MarketplaceTab() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 animate-slide-up">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC]">NFT Marketplace</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">{mockNFTs.filter(n => n.status === 'available').length} NFTs available for trading</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg text-[10px] sm:text-xs text-[#EC4899] hover:bg-[#EC4899]/20 transition-all active:scale-95">
                        🔥 Hot
                    </button>
                    <button className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-[10px] sm:text-xs text-[#94A3B8] hover:border-[#EC4899]/30 transition-all active:scale-95">
                        All
                    </button>
                </div>
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {mockNFTs.map((nft, index) => (
                    <div
                        key={nft.id}
                        className={`
              relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border card-hover group animate-slide-up
              ${nft.status === 'burned' ? 'border-[#EF4444]/50' : 'border-[#334155] hover:border-[#EC4899]/50'}
            `}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {/* Glow effect */}
                        {nft.status === 'available' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#EC4899]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        )}

                        {/* Status Badge */}
                        <div className={`
              absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold backdrop-blur-sm
              ${nft.status === 'available' ? 'bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/50' : ''}
              ${nft.status === 'sold' ? 'bg-[#3B82F6]/30 text-[#3B82F6] border border-[#3B82F6]/50' : ''}
              ${nft.status === 'burned' ? 'bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/50' : ''}
              ${nft.status === 'pending' ? 'bg-[#D946EF]/30 text-[#D946EF] border border-[#D946EF]/50' : ''}
            `}>
                            {nft.status === 'available' && '🟢'}
                            {nft.status === 'sold' && '🔵'}
                            {nft.status === 'burned' && '🔥'}
                            {nft.status === 'pending' && '⏳'}
                        </div>

                        {/* NFT Image */}
                        <div className="h-20 sm:h-28 md:h-36 bg-gradient-to-br from-[#EC4899]/10 via-[#0F172A] to-[#D946EF]/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#EC4899]/20 to-[#D946EF]/20 blur-xl" />
                            </div>
                            <span className={`relative text-4xl sm:text-5xl md:text-6xl ${nft.status === 'burned' ? 'burn-effect' : 'float-slow group-hover:scale-110 transition-transform duration-300'}`}>
                                🪙
                            </span>
                        </div>

                        {/* NFT Info */}
                        <div className="p-2 sm:p-3 md:p-4">
                            <div className="flex justify-between items-start mb-1 sm:mb-2">
                                <p className="text-[8px] sm:text-[10px] md:text-xs text-[#64748B] font-mono">#{nft.id}</p>
                                <p className="text-sm sm:text-lg md:text-xl font-bold text-[#EC4899]">${nft.value}</p>
                            </div>

                            {nft.status === 'available' && (
                                <button className="w-full mt-2 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-lg text-[#0F172A] text-[10px] sm:text-xs font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-300 active:scale-95">
                                    🛒 Buy
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
