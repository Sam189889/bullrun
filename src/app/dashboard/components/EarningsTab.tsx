'use client';

import { mockTransactions } from '@/lib/mockData';
import { useState } from 'react';

const tabs = ['All', 'Level', 'Trading', 'Burn'];

export function EarningsTab() {
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredTransactions = activeFilter === 'All'
        ? mockTransactions
        : mockTransactions.filter(t => t.type.toLowerCase().includes(activeFilter.toLowerCase()));

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                    { icon: '💰', label: 'Total Earnings', value: '$1,234', color: '#10B981' },
                    { icon: '💸', label: 'Withdrawable', value: '$890', color: '#EC4899' },
                    { icon: '🔥', label: 'Deducted', value: '$344', color: '#EF4444' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-xl p-3 sm:p-4 border animate-slide-up"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            background: `linear-gradient(to bottom right, ${stat.color}20, #1E293B)`,
                            borderColor: `${stat.color}30`
                        }}
                    >
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20">{stat.icon}</div>
                        <p className="text-[10px] sm:text-xs text-[#64748B]">{stat.label}</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`
              px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 active:scale-95
              ${activeFilter === tab
                                ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:border-[#EC4899]/50'
                            }
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="divide-y divide-[#334155]">
                    {filteredTransactions.slice(0, 8).map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg
                  ${tx.type === 'burn_reward' ? 'bg-[#EF4444]/20' : ''}
                  ${tx.type === 'level' ? 'bg-[#3B82F6]/20' : ''}
                  ${tx.type === 'registration' ? 'bg-[#10B981]/20' : ''}
                  ${tx.type === 'trading' ? 'bg-[#D946EF]/20' : ''}
                  ${tx.type === 'deduction' ? 'bg-[#EF4444]/20' : ''}
                `}>
                                    {tx.type === 'burn_reward' && '🔥'}
                                    {tx.type === 'level' && '📈'}
                                    {tx.type === 'registration' && '📝'}
                                    {tx.type === 'trading' && '💱'}
                                    {tx.type === 'deduction' && '➖'}
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-[#F8FAFC] capitalize">{tx.type.replace('_', ' ')}</p>
                                    <p className="text-[8px] sm:text-xs text-[#64748B]">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-xs sm:text-sm font-mono font-bold ${tx.amount > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </p>
                                <span className={`
                  text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full
                  ${tx.status === 'credited' ? 'bg-[#10B981]/20 text-[#10B981]' : ''}
                  ${tx.status === 'pending' ? 'bg-[#D946EF]/20 text-[#D946EF]' : ''}
                  ${tx.status === 'processing' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : ''}
                `}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Withdraw Button */}
            <button className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-xl text-white font-bold text-xs sm:text-sm hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-98 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                💸 Withdraw Earnings
            </button>
        </div>
    );
}
