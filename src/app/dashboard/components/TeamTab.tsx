'use client';

import { mockTeamMembers } from '@/lib/mockData';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useState } from 'react';

export function TeamTab() {
    const [copied, setCopied] = useState(false);
    const referralLink = 'https://bullrunnft.com/ref/0x1234';

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Referral Link */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EC4899]/20 via-[#1E293B] to-[#D946EF]/20 rounded-xl p-4 sm:p-5 border border-[#EC4899]/30 animate-slide-up">
                <div className="absolute top-2 right-4 text-3xl sm:text-4xl opacity-10 float-slow">👥</div>
                <p className="text-[10px] sm:text-xs text-[#EC4899] font-medium mb-2">🔗 Your Referral Link</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-sm text-[#F8FAFC] font-mono"
                    />
                    <button
                        onClick={copyLink}
                        className={`
              px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95
              ${copied
                                ? 'bg-[#10B981] text-white'
                                : 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                            }
            `}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#1E293B] rounded-xl p-3 sm:p-4 border border-[#EC4899]/30">
                    <div className="flex justify-between mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-sm text-[#F8FAFC] font-medium">👥 Referrals</p>
                        <p className="text-[10px] sm:text-sm text-[#EC4899] font-bold">4/10</p>
                    </div>
                    <ProgressBar value={4} max={10} showPercentage={false} size="sm" />
                </div>
                <div className="bg-gradient-to-br from-[#10B981]/10 to-[#1E293B] rounded-xl p-3 sm:p-4 border border-[#10B981]/30">
                    <div className="flex justify-between mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-sm text-[#F8FAFC] font-medium">📈 Levels</p>
                        <p className="text-[10px] sm:text-sm text-[#10B981] font-bold">6/15</p>
                    </div>
                    <ProgressBar value={6} max={15} showPercentage={false} size="sm" variant="success" />
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {[
                    { value: 15, label: 'Total', color: '#F8FAFC', icon: '👥' },
                    { value: 12, label: 'Active', color: '#10B981', icon: '✅' },
                    { value: 3, label: 'Inactive', color: '#EF4444', icon: '❌' },
                    { value: '$2.5K', label: 'Volume', color: '#EC4899', icon: '💰' },
                ].map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-2 sm:p-3 border border-[#334155] text-center card-hover">
                        <span className="text-sm sm:text-lg mb-0.5 sm:mb-1 block">{stat.icon}</span>
                        <p className="text-base sm:text-lg md:text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[8px] sm:text-[10px] text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Team Members */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="p-3 sm:p-4 border-b border-[#334155] flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">👥 Team Members</h3>
                    <span className="text-[10px] sm:text-xs text-[#3B82F6] cursor-pointer hover:underline">View All</span>
                </div>
                <div className="divide-y divide-[#334155]">
                    {mockTeamMembers.slice(0, 4).map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] flex items-center justify-center text-sm sm:text-lg shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                                    👤
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-sm text-[#F8FAFC] font-mono">{member.walletAddress}</p>
                                    <p className="text-[8px] sm:text-xs text-[#64748B]">{member.packageId} • L{member.level}</p>
                                </div>
                            </div>
                            <span className={`
                px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium
                ${member.status === 'active' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}
              `}>
                                {member.status === 'active' ? '🟢' : '🔴'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
