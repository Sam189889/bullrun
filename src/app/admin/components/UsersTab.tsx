'use client';

import { useState } from 'react';

const mockUsers = [
    { wallet: '0x1234...5678', package: '$100', status: 'active', joined: '2026-01-08', team: 15, earnings: 1234 },
    { wallet: '0xabcd...efgh', package: '$50', status: 'active', joined: '2026-01-07', team: 8, earnings: 567 },
    { wallet: '0x9876...5432', package: '$25', status: 'inactive', joined: '2026-01-06', team: 3, earnings: 123 },
    { wallet: '0xfedc...ba98', package: '$200', status: 'active', joined: '2026-01-05', team: 25, earnings: 2345 },
    { wallet: '0x5555...aaaa', package: '$15', status: 'inactive', joined: '2026-01-04', team: 1, earnings: 45 },
];

export function UsersTab() {
    const [search, setSearch] = useState('');

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 animate-slide-up">
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F8FAFC]">👥 User Management</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">{mockUsers.length} total users</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 sm:w-32 md:w-48 bg-[#1E293B] border border-[#334155] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-[#F8FAFC] placeholder-[#64748B]"
                    />
                    <button className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-lg text-[10px] sm:text-xs font-bold text-white active:scale-95 transition-transform">
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {[
                    { value: '4,521', label: 'Active', color: '#10B981' },
                    { value: '234', label: 'Inactive', color: '#EF4444' },
                    { value: '85', label: 'New Today', color: '#EC4899' },
                ].map((stat, i) => (
                    <div key={i} className="bg-gradient-to-br rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border text-center card-hover" style={{ background: `linear-gradient(to bottom right, ${stat.color}20, #1E293B)`, borderColor: `${stat.color}30` }}>
                        <p className="text-base sm:text-lg md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[8px] sm:text-[10px] md:text-xs text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] sm:text-xs md:text-sm">
                        <thead className="bg-[#0F172A]">
                            <tr>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Wallet</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Pkg</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Status</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium hidden md:table-cell">Team</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Earned</th>
                                <th className="text-left p-2.5 sm:p-3 md:p-4 text-[#64748B] font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {mockUsers.map((user, index) => (
                                <tr key={index} className="hover:bg-[#1E293B]/50 transition-colors">
                                    <td className="p-2.5 sm:p-3 md:p-4">
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center text-[8px] sm:text-xs">👤</div>
                                            <span className="text-[#F8FAFC] font-mono text-[8px] sm:text-[10px] md:text-xs">{user.wallet}</span>
                                        </div>
                                    </td>
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#EC4899] font-bold text-[10px] sm:text-xs">{user.package}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4">
                                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] ${user.status === 'active' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#94A3B8] hidden md:table-cell">{user.team}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4 text-[#10B981] font-mono text-[10px] sm:text-xs">${user.earnings}</td>
                                    <td className="p-2.5 sm:p-3 md:p-4">
                                        <button className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-[8px] sm:text-[10px] hover:bg-[#3B82F6]/30 transition-colors active:scale-95">
                                            View
                                        </button>
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
