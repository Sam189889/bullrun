'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserId, useUserInfo, useUserWallet } from '@/hooks/useContracts';
import {
    usePackagePurchasedEvents,
    useNFTBuyEvents,
    useNFTSellEvents,
} from '@/hooks/useEvents';

// Helper to truncate address
const truncateAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Format BULL username
const formatBullName = (usernameId: bigint | number | undefined) => {
    if (!usernameId) return 'BULL---';
    return `BULL${usernameId.toString()}`;
};

// Local type for package events
interface PackageEvent {
    userId: bigint;
    packageLevel: bigint;
    price: bigint;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

const PACKAGE_NAMES = ['None', 'Starter', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Master', 'VIP'];

// Sub-tab types
type SubTab = 'activation' | 'topup' | 'upgrade' | 'trading' | 'burning';

// User Info interface  
interface UserInfoData {
    referrerId: bigint;
    packageLevel: bigint;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    activationDate: bigint;
    directReferralsCount: bigint;
    usernameId: bigint;
}

export function HistoryTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: userInfoData } = useUserInfo(userId as bigint);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('activation');

    // Parse user info
    const userInfo = userInfoData as UserInfoData | undefined;
    const usernameId = userInfo?.usernameId;

    const subTabs = [
        { id: 'activation' as SubTab, label: 'Activation', icon: '✅' },
        { id: 'topup' as SubTab, label: 'Top-Up', icon: '🔄' },
        { id: 'upgrade' as SubTab, label: 'Upgrade', icon: '⬆️' },
        { id: 'trading' as SubTab, label: 'Trading', icon: '📈' },
        { id: 'burning' as SubTab, label: 'Burning', icon: '🔥' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC]">📜 History</h2>
                <p className="text-[10px] sm:text-xs text-[#64748B]">Track all your activities</p>
            </div>

            {/* Sub-tabs - Mobile Responsive */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide animate-slide-up -mx-1 px-1" style={{ animationDelay: '0.1s' }}>
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`
                            flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                            ${activeSubTab === tab.id
                                ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]'
                            }
                        `}
                    >
                        <span className="text-sm sm:text-base">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {activeSubTab === 'activation' && <ActivationHistory userId={userId as bigint} usernameId={usernameId} walletAddress={address} />}
                {activeSubTab === 'topup' && <TopUpHistory userId={userId as bigint} usernameId={usernameId} walletAddress={address} />}
                {activeSubTab === 'upgrade' && <UpgradeHistory userId={userId as bigint} usernameId={usernameId} walletAddress={address} />}
                {activeSubTab === 'trading' && <TradingHistory userId={userId as bigint} walletAddress={address} />}
                {activeSubTab === 'burning' && <BurningHistory userId={userId as bigint} walletAddress={address} />}
            </div>
        </div>
    );
}

// Props for package history
interface PackageHistoryProps {
    userId: bigint | undefined;
    usernameId: bigint | undefined;
    walletAddress: `0x${string}` | undefined;
}

// Activation History - First package purchase
function ActivationHistory({ userId, usernameId, walletAddress }: PackageHistoryProps) {
    const { events, isLoading } = usePackagePurchasedEvents(userId);

    // First purchase is activation
    const activationEvents = events.filter((_, i) => i === 0 || events[i - 1]?.packageLevel !== events[i]?.packageLevel);

    if (isLoading) return <LoadingState />;
    if (!activationEvents.length) return <EmptyState message="No activation history" />;

    return (
        <div className="space-y-3">
            {activationEvents.slice(0, 5).map((event, i) => (
                <HistoryCard
                    key={i}
                    icon="✅"
                    title={`Activated ${PACKAGE_NAMES[Number(event.packageLevel)]}`}
                    usernameId={usernameId}
                    walletAddress={walletAddress}
                    amount={`$${Number(formatUnits(event.price, 18)).toFixed(2)}`}
                    txHash={event.transactionHash}
                />
            ))}
        </div>
    );
}

// Top-Up History - Same package purchases
function TopUpHistory({ userId, usernameId, walletAddress }: PackageHistoryProps) {
    const { events, isLoading } = usePackagePurchasedEvents(userId);

    // Group by package and filter re-purchases of same package
    const topUpEvents: (PackageEvent & { count: number })[] = [];
    const packageCounts = new Map<number, number>();

    events.forEach((event) => {
        const lvl = Number(event.packageLevel);
        const count = (packageCounts.get(lvl) || 0) + 1;
        packageCounts.set(lvl, count);
        if (count > 1) {
            topUpEvents.push({ ...event, count });
        }
    });

    if (isLoading) return <LoadingState />;
    if (!topUpEvents.length) return <EmptyState message="No top-up history" />;

    return (
        <div className="space-y-3">
            {topUpEvents.slice(0, 20).map((event, i) => (
                <HistoryCard
                    key={i}
                    icon="🔄"
                    title={`Top-Up #${event.count} - ${PACKAGE_NAMES[Number(event.packageLevel)]}`}
                    usernameId={usernameId}
                    walletAddress={walletAddress}
                    amount={`$${Number(formatUnits(event.price, 18)).toFixed(2)}`}
                    txHash={event.transactionHash}
                />
            ))}
        </div>
    );
}

// Upgrade History - Package level increases
function UpgradeHistory({ userId, usernameId, walletAddress }: PackageHistoryProps) {
    const { events, isLoading } = usePackagePurchasedEvents(userId);

    // Filter for upgrades (higher package level than previous)
    const upgradeEvents = events.filter((event, i) => {
        if (i === 0) return false;
        const prevMax = Math.max(...events.slice(0, i).map(e => Number(e.packageLevel)));
        return Number(event.packageLevel) > prevMax;
    });

    if (isLoading) return <LoadingState />;
    if (!upgradeEvents.length) return <EmptyState message="No upgrade history" />;

    return (
        <div className="space-y-3">
            {upgradeEvents.map((event, i) => (
                <HistoryCard
                    key={i}
                    icon="⬆️"
                    title={`Upgraded to ${PACKAGE_NAMES[Number(event.packageLevel)]}`}
                    usernameId={usernameId}
                    walletAddress={walletAddress}
                    amount={`$${Number(formatUnits(event.price, 18)).toFixed(2)}`}
                    txHash={event.transactionHash}
                />
            ))}
        </div>
    );
}

// Trading History Props
interface TradingHistoryProps {
    userId: bigint | undefined;
    walletAddress: `0x${string}` | undefined;
}

// Trading History - NFT buys and sells
function TradingHistory({ userId, walletAddress }: TradingHistoryProps) {
    const { events: buyEvents, isLoading: buyLoading } = useNFTBuyEvents(userId);
    const { events: sellEvents, isLoading: sellLoading } = useNFTSellEvents(userId);

    const allTrades = [
        ...buyEvents.map(e => ({ ...e, type: 'buy' as const })),
        ...sellEvents.map(e => ({ ...e, type: 'sell' as const })),
    ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

    if (buyLoading || sellLoading) return <LoadingState />;
    if (!allTrades.length) return <EmptyState message="No trading history" />;

    return (
        <div className="space-y-3">
            {allTrades.slice(0, 30).map((event, i) => (
                <TradingCard
                    key={i}
                    type={event.type}
                    nftId={event.nftId}
                    price={event.price}
                    appreciation={event.appreciation}
                    sellerId={event.sellerId}
                    buyerId={event.buyerId}
                    sellerUsernameId={event.sellerUsernameId}
                    buyerUsernameId={event.buyerUsernameId}
                    txHash={event.transactionHash}
                />
            ))}
        </div>
    );
}

// Burning History - NFTs burned (sold at $200)
function BurningHistory({ userId, walletAddress }: TradingHistoryProps) {
    const { events, isLoading } = useNFTSellEvents(userId);

    // Filter burns (sales at $200 threshold)
    const burnEvents = events.filter(e =>
        Number(formatUnits(e.price, 18)) >= 199
    );

    if (isLoading) return <LoadingState />;
    if (!burnEvents.length) return <EmptyState message="No burning history" />;

    return (
        <div className="space-y-3">
            {burnEvents.map((event, i) => (
                <BurnCard
                    key={i}
                    nftId={event.nftId}
                    price={event.price}
                    sellerId={event.sellerId}
                    sellerUsernameId={event.sellerUsernameId}
                    txHash={event.transactionHash}
                />
            ))}
        </div>
    );
}

// ============ Card Components ============

// Standard History Card (for Package events)
function HistoryCard({ icon, title, usernameId, walletAddress, amount, txHash }: {
    icon: string;
    title: string;
    usernameId?: bigint;
    walletAddress?: string;
    amount: string;
    txHash: `0x${string}`;
}) {
    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-xl p-3 sm:p-4 hover:border-[#EC4899]/30 transition-all">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[#F8FAFC]">{title}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-[10px] sm:text-xs text-[#EC4899] font-semibold">
                                {formatBullName(usernameId)}
                            </span>
                            {walletAddress && (
                                <span className="text-[10px] sm:text-xs text-[#64748B] font-mono">
                                    ({truncateAddress(walletAddress)})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#EC4899] flex-shrink-0">{amount}</p>
            </div>
            <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#3B82F6] hover:underline mt-2 inline-block"
            >
                View Tx ↗
            </a>
        </div>
    );
}

// Trading Card (for NFT Buy/Sell events)
function TradingCard({ type, nftId, price, appreciation, sellerId, buyerId, sellerUsernameId, buyerUsernameId, txHash }: {
    type: 'buy' | 'sell';
    nftId: bigint;
    price: bigint;
    appreciation: bigint;
    sellerId: bigint;
    buyerId: bigint;
    sellerUsernameId: bigint;
    buyerUsernameId: bigint;
    txHash: `0x${string}`;
}) {
    // Fetch wallet addresses for buyer and seller
    const { data: sellerWallet } = useUserWallet(sellerId);
    const { data: buyerWallet } = useUserWallet(buyerId);

    const isBuy = type === 'buy';
    const priceStr = `$${Number(formatUnits(price, 18)).toFixed(2)}`;
    const profitStr = `+$${Number(formatUnits(appreciation, 18)).toFixed(2)}`;

    return (
        <div className={`bg-gradient-to-br from-[#1E293B] to-[#0F172A] border rounded-xl p-3 sm:p-4 transition-all ${isBuy ? 'border-[#3B82F6]/30' : 'border-[#10B981]/30'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{isBuy ? '🛒' : '💰'}</span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                            {isBuy ? 'Bought' : 'Sold'} NFT #{nftId.toString()}
                        </p>
                        {/* Main user info */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-[10px] sm:text-xs text-[#EC4899] font-semibold">
                                {isBuy ? formatBullName(buyerUsernameId) : formatBullName(sellerUsernameId)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-[#64748B] font-mono">
                                ({truncateAddress(isBuy ? (buyerWallet as string) : (sellerWallet as string))})
                            </span>
                        </div>
                        {/* Counterparty info */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-[10px] text-[#64748B]">
                            <span>{isBuy ? 'From:' : 'To:'}</span>
                            <span className="text-[#94A3B8]">
                                {isBuy ? formatBullName(sellerUsernameId) : formatBullName(buyerUsernameId)}
                            </span>
                            <span className="font-mono">
                                ({truncateAddress(isBuy ? (sellerWallet as string) : (buyerWallet as string))})
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className={`text-sm sm:text-base font-bold ${isBuy ? 'text-[#3B82F6]' : 'text-[#10B981]'}`}>
                        {priceStr}
                    </p>
                    {!isBuy && (
                        <p className="text-[10px] sm:text-xs text-[#10B981] font-semibold">{profitStr}</p>
                    )}
                </div>
            </div>
            <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#3B82F6] hover:underline mt-2 inline-block"
            >
                View Tx ↗
            </a>
        </div>
    );
}

// Burn Card (for NFT Burn events)
function BurnCard({ nftId, price, sellerId, sellerUsernameId, txHash }: {
    nftId: bigint;
    price: bigint;
    sellerId: bigint;
    sellerUsernameId: bigint;
    txHash: `0x${string}`;
}) {
    // Fetch seller wallet address
    const { data: sellerWallet } = useUserWallet(sellerId);
    const priceStr = `$${Number(formatUnits(price, 18)).toFixed(2)}`;

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#EF4444]/30 rounded-xl p-3 sm:p-4 transition-all">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                    <span className="text-xl sm:text-2xl flex-shrink-0">🔥</span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                            NFT #{nftId.toString()} Burned
                        </p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-[10px] sm:text-xs text-[#EC4899] font-semibold">
                                {formatBullName(sellerUsernameId)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-[#64748B] font-mono">
                                ({truncateAddress(sellerWallet as string)})
                            </span>
                        </div>
                        <p className="text-[10px] text-[#F59E0B] mt-1">
                            25% → Owner • 75% → Buffer
                        </p>
                    </div>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#EF4444] flex-shrink-0">{priceStr}</p>
            </div>
            <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#3B82F6] hover:underline mt-2 inline-block"
            >
                View Tx ↗
            </a>
        </div>
    );
}

// ============ Utility Components ============

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin text-3xl">⏳</div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 bg-[#1E293B]/50 rounded-xl border border-[#334155]">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-sm text-[#64748B]">{message}</p>
        </div>
    );
}
