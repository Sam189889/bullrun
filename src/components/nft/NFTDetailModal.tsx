'use client';

import { NFT } from '@/lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface NFTDetailModalProps {
    nft: NFT | null;
    isOpen: boolean;
    onClose: () => void;
    onBuy?: () => void;
}

export function NFTDetailModal({ nft, isOpen, onClose, onBuy }: NFTDetailModalProps) {
    if (!nft) return null;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date));
    };

    // Earnings breakdown for $25 NFT
    const earningsBreakdown = nft.value === 25 ? [
        { label: 'Holder Receives', value: 17.166 },
        { label: 'Burning Wallet', value: 7.50 },
        { label: 'Level Income', value: 'Distributed' },
        { label: 'Creator Fee', value: 0.1666 },
    ] : [
        { label: 'Auto Burn', value: 'Yes' },
        { label: 'Converts to', value: '3× $25 NFTs' },
        { label: 'Available for', value: 'Trading' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            {/* NFT Image */}
            <div className="relative h-48 bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] rounded-xl flex items-center justify-center mb-6">
                <span className={`text-8xl ${nft.status === 'available' ? 'coin-float' : ''}`}>
                    {nft.value === 50 ? '💎' : '🪙'}
                </span>
            </div>

            {/* NFT Info */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#F8FAFC]">NFT #{nft.id}</h3>
                    <span className="text-3xl font-bold text-[#EC4899] font-mono">${nft.value}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[#64748B]">Created</p>
                        <p className="text-[#F8FAFC]">{formatDate(nft.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-[#64748B]">Status</p>
                        <p className={`
              ${nft.status === 'available' ? 'text-[#10B981]' : ''}
              ${nft.status === 'sold' ? 'text-[#EF4444]' : ''}
              ${nft.status === 'burned' ? 'text-[#D946EF]' : ''}
              ${nft.status === 'pending' ? 'text-[#94A3B8]' : ''}
              capitalize
            `}>
                            {nft.status}
                        </p>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="bg-[#0F172A] rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                        {nft.value === 25 ? 'EARNINGS BREAKDOWN' : 'BURNING INFO'}
                    </h4>
                    <div className="space-y-2">
                        {earningsBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-[#94A3B8]">├─ {item.label}</span>
                                <span className="text-[#F8FAFC] font-mono">
                                    {typeof item.value === 'number' ? `$${item.value.toFixed(4)}` : item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Burn Reward Notice */}
                {nft.value === 25 && (
                    <div className="bg-[#D946EF]/10 border border-[#D946EF]/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">🔥</span>
                            <span className="font-semibold text-[#D946EF]">BURN REWARD</span>
                        </div>
                        <p className="text-2xl font-bold text-[#EC4899] font-mono">$25.75</p>
                        <p className="text-xs text-[#94A3B8]">(Credited after 1 hour)</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    {nft.status === 'available' && (
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            onClick={onBuy}
                        >
                            Buy Now - ${nft.value}
                        </Button>
                    )}
                    <Button variant="ghost" size="lg" onClick={onClose}>
                        {nft.status === 'available' ? 'Cancel' : 'Close'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
