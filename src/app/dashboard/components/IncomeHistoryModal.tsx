'use client';

import { formatUnits } from 'viem';
import { useIncomeEvents, useRankEmiClaimedEvents, useFastBonusClaimedEvents, useNFTSellEvents, useTripRewardEvents, useLuckyDrawWinnerEvents } from '@/hooks/useEvents';

interface IncomeHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: string;
    userId: bigint | undefined;
    color: string;
    icon: string;
}

interface IncomeEvent {
    amount: bigint;
    details: string;
    subDetails?: string;
    txHash: string;
    timestamp?: number;
}

export function IncomeHistoryModal({ isOpen, onClose, type, userId, color, icon }: IncomeHistoryModalProps) {
    // Fetch events based on income type
    const { events: incomeEvents, isLoading: incomeLoading } = useIncomeEvents(userId);
    const { events: emiEvents, isLoading: emiLoading } = useRankEmiClaimedEvents(userId);
    const { events: fastBonusEvents, isLoading: fastBonusLoading } = useFastBonusClaimedEvents(userId);
    const { events: nftSoldEvents, isLoading: nftLoading } = useNFTSellEvents(userId);
    const { events: tripRewardEvents, isLoading: tripLoading } = useTripRewardEvents(userId);
    const { events: luckyDrawEvents, isLoading: luckyLoading } = useLuckyDrawWinnerEvents(userId);

    // Get rank name from enum value
    const getRankName = (rank: number) => {
        const ranks = ['NONE', 'CALF', 'BULL', 'LEAD BULL', 'KING BULL', 'TITAN'];
        return ranks[rank] || 'UNKNOWN';
    };

    // Filter and format events based on income type
    const getFilteredEvents = (): IncomeEvent[] => {
        switch (type) {
            case 'Direct Sponsor':
                return incomeEvents
                    .filter(e => e.incomeType === 'DIRECT_SPONSOR')
                    .map(e => ({
                        amount: e.amount,
                        details: `From BULL${e.fromUsernameId}`,
                        subDetails: `Direct referral income (15%)`,
                        txHash: e.transactionHash,
                    }));

            case 'Level Income':
                return incomeEvents
                    .filter(e => e.incomeType === 'LEVEL_INCOME')
                    .map(e => ({
                        amount: e.amount,
                        details: `Level ${e.level} - BULL${e.fromUsernameId}`,
                        subDetails: `Team level income`,
                        txHash: e.transactionHash,
                    }));

            case 'Trading Level Bonus':
                return incomeEvents
                    .filter(e => e.incomeType === 'TRADING_LEVEL')
                    .map(e => ({
                        amount: e.amount,
                        details: `Level ${e.level} - BULL${e.fromUsernameId}`,
                        subDetails: `From NFT trade by BULL${e.fromUsernameId}`,
                        txHash: e.transactionHash,
                    }));

            case 'Rank EMI':
                return emiEvents.map(e => ({
                    amount: e.amount,
                    details: `EMI #${e.emiNumber} - ${getRankName(e.rank)}`,
                    subDetails: `Rank achievement reward`,
                    txHash: e.transactionHash,
                }));

            case 'Fast Bonus':
                return fastBonusEvents.map(e => ({
                    amount: e.amount,
                    details: `${getRankName(e.rank)} Fast Bonus`,
                    subDetails: `Quick achievement bonus`,
                    txHash: e.transactionHash,
                }));

            case 'NFT Profit':
                // Filter NFT sales where user was the seller
                return nftSoldEvents
                    .filter(e => e.sellerId === userId)
                    .map(e => ({
                        amount: (e.appreciation * BigInt(25)) / BigInt(100), // 25% of appreciation
                        details: `NFT #${e.nftId} sold to BULL${e.buyerUsernameId}`,
                        subDetails: `Sale price: $${Number(formatUnits(e.price, 18)).toFixed(2)}`,
                        txHash: e.transactionHash,
                    }));

            case 'Trip Reward':
                return tripRewardEvents.map(e => ({
                    amount: e.amount,
                    details: `Trip Reward Distribution`,
                    subDetails: `Admin reward`,
                    txHash: e.transactionHash,
                }));

            case 'Lucky Draw':
                return luckyDrawEvents.map(e => ({
                    amount: e.prize,
                    details: `Week #${e.week} Winner! 🎉`,
                    subDetails: `Lucky draw prize`,
                    txHash: e.transactionHash,
                }));

            default:
                return [];
        }
    };

    const filteredEvents = getFilteredEvents();
    const isLoading = incomeLoading || emiLoading || fastBonusLoading || nftLoading || tripLoading || luckyLoading;

    const formatUSDT = (value: bigint) => `$${Number(formatUnits(value, 18)).toFixed(2)}`;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-[#334155] w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto animate-slide-up shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#334155]">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">{type}</h2>
                                <p className="text-xs sm:text-sm text-[#64748B]">
                                    {filteredEvents.length} transaction{filteredEvents.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#334155] hover:bg-[#475569] text-white flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-12 h-12 border-4 border-[#334155] border-t-[#EC4899] rounded-full animate-spin mb-4" />
                                <p className="text-[#64748B]">Loading history...</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-6xl mb-4 opacity-20">{icon}</div>
                                <p className="text-lg font-semibold text-[#F8FAFC] mb-2">No History Yet</p>
                                <p className="text-sm text-[#64748B]">Start earning to see your transaction history</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredEvents.map((event, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-[#0F172A] rounded-xl p-4 border border-[#334155] hover:border-[#475569] transition-all hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm" style={{ color }}>●</span>
                                                    <p className="text-sm font-semibold text-[#F8FAFC]">
                                                        {event.details}
                                                    </p>
                                                </div>
                                                {event.subDetails && (
                                                    <p className="text-xs text-[#64748B] ml-5">
                                                        {event.subDetails}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-bold font-mono" style={{ color }}>
                                                    +{formatUSDT(event.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E293B]">
                                            <span className="text-xs text-[#64748B]">
                                                Transaction #{idx + 1}
                                            </span>
                                            <a
                                                href={`https://testnet.opbnbscan.com/tx/${event.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[#EC4899] hover:text-[#D946EF] flex items-center gap-1 transition-colors"
                                            >
                                                View on Explorer 🔗
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {filteredEvents.length > 0 && (
                        <div className="p-4 sm:p-6 border-t border-[#334155] bg-[#0F172A]/50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#64748B]">Total Earned</span>
                                <span className="font-bold font-mono text-lg" style={{ color }}>
                                    {formatUSDT(filteredEvents.reduce((sum, e) => sum + e.amount, BigInt(0)))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
