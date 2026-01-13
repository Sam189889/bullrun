'use client';

import { NFT } from '@/lib/types';
import { Button } from '../ui/Button';

interface NFTCardProps {
    nft: NFT;
    onClick?: () => void;
}

export function NFTCard({ nft, onClick }: NFTCardProps) {
    const statusConfig = {
        available: { badge: '🟢 Available', color: 'badge-success' },
        sold: { badge: '🔴 Sold', color: 'badge-danger' },
        burned: { badge: '🔥 Burned', color: 'badge-warning' },
        pending: { badge: '⏳ Pending', color: 'badge-pending' },
    };

    const status = statusConfig[nft.status];

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(date));
    };

    return (
        <div
            className={`
        bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden
        transition-all duration-300
        hover:border-[#EC4899]/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]
        ${nft.status === 'burned' ? 'burn-effect' : ''}
      `}
        >
            {/* NFT Image */}
            <div className="relative h-40 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex items-center justify-center">
                <span className={`text-6xl ${nft.status === 'available' ? 'coin-float' : ''}`}>
                    {nft.value === 50 ? '💎' : '🪙'}
                </span>
                {nft.status === 'burned' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#EF4444]/30 to-transparent" />
                )}
            </div>

            {/* Card Body */}
            <div className="p-4">
                {/* NFT ID & Status */}
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-[#94A3B8]">#{nft.id}</span>
                    <span className={`badge ${status.color}`}>
                        {status.badge}
                    </span>
                </div>

                {/* Value */}
                <p className="text-2xl font-bold text-[#EC4899] font-mono mb-3">
                    ${nft.value}
                </p>

                {/* Date & Time */}
                <div className="flex items-center gap-4 text-xs text-[#64748B] mb-4">
                    <span>📅 {formatDate(nft.createdAt)}</span>
                    <span>⏰ {formatTime(nft.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {nft.status === 'available' ? (
                        <>
                            <Button variant="primary" size="sm" className="flex-1" onClick={onClick}>
                                Buy Now
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClick}>
                                Details
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="sm" className="flex-1" onClick={onClick}>
                            View Details
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
