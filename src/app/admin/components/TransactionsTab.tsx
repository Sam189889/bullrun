'use client';

import { useState } from 'react';

const mockTransactions = [
    { id: 'TX001', type: 'Registration', amount: 100, wallet: '0x1234...5678', status: 'completed', date: '2026-01-08' },
    { id: 'TX002', type: 'NFT Sale', amount: 25, wallet: '0xabcd...efgh', status: 'completed', date: '2026-01-08' },
    { id: 'TX003', type: 'Burn Reward', amount: 25.75, wallet: '0x9876...5432', status: 'processing', date: '2026-01-08' },
    { id: 'TX004', type: 'Level Income', amount: 0.0125, wallet: '0xfedc...ba98', status: 'completed', date: '2026-01-08' },
    { id: 'TX005', type: 'Withdrawal', amount: -500, wallet: '0x5555...aaaa', status: 'pending', date: '2026-01-08' },
];

const filters = ['All', 'Registration', 'Sale', 'Burn', 'Withdrawal'];

export function TransactionsTab() {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F8FAFC]">💰 Transactions</h2>
                <p className="text-[10px] sm:text-xs text-[#64748B]">All platform transactions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {[
                    { label: 'Today', value: '$12K', color: '#10B981' },
                    { label: 'Week', value: '$89K', color: '#3B82F6' },
                    { label: 'Month', value: '$345K', color: '#D946EF' },
                    { label: 'Total', value: '$2.5M', color: '#EC4899' },
                ].map((stat, i) => (
                    <div key={i} className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg p-2 sm:p-2.5 md:p-3 border border-[#334155] text-center card-hover">
                        <p className="text-xs sm:text-base md:text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[7px] sm:text-[8px] md:text-[10px] text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto pb-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
              px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap transition-all active:scale-95
              ${activeFilter === filter
                                ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:border-[#10B981]/50'
                            }
            `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] sm:text-xs md:text-sm">
                        <thead className="bg-[#0F172A]">
                            <tr>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">ID</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Type</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Amount</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium hidden sm:table-cell">Wallet</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {mockTransactions.map((tx, index) => (
                                <tr key={index} className="hover:bg-[#1E293B]/50 transition-colors">
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#94A3B8] font-mono text-[8px] sm:text-[10px] md:text-xs">{tx.id}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#F8FAFC] text-[10px] sm:text-xs">{tx.type}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4">
                                        <span className={`font-mono font-bold text-[10px] sm:text-xs ${tx.amount > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                            {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                                        </span>
                                    </td>
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#94A3B8] font-mono text-[8px] sm:text-[10px] hidden sm:table-cell">{tx.wallet}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4">
                                        <span className={`
                      px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px]
                      ${tx.status === 'completed' ? 'bg-[#10B981]/20 text-[#10B981]' : ''}
                      ${tx.status === 'processing' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : ''}
                      ${tx.status === 'pending' ? 'bg-[#D946EF]/20 text-[#D946EF]' : ''}
                    `}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
