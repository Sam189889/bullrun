'use client';

import { StatCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function HomeTab() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EC4899]/20 via-[#1E293B] to-[#D946EF]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#EC4899]/30 animate-slide-up">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 text-5xl sm:text-6xl opacity-10 float-slow">💰</div>
                    <div className="absolute bottom-0 left-10 text-3xl sm:text-4xl opacity-10 float-medium">🪙</div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#F8FAFC] mb-1 sm:mb-2">
                        Welcome back, <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Trader!</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">Your portfolio is up 12% today 📈</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {[
                    { icon: '💰', value: '$1,234', label: 'Total Income', color: '#EC4899', change: '+12%' },
                    { icon: '📈', value: '$45', label: 'Today Income', color: '#10B981', change: '+8%' },
                    { icon: '🪙', value: '28', label: 'NFTs Owned', color: '#3B82F6' },
                    { icon: '👥', value: '15', label: 'Team Size', color: '#D946EF' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="animate-slide-up bg-gradient-to-br rounded-xl p-3 sm:p-4 border card-hover group"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            background: `linear-gradient(to bottom right, ${stat.color}15, #1E293B)`,
                            borderColor: `${stat.color}30`
                        }}
                    >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                            {stat.change && <span className="text-[10px] sm:text-xs text-[#10B981]">{stat.change}</span>}
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[10px] sm:text-xs text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Trading Status */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-4 sm:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="absolute top-2 right-2 text-2xl sm:text-3xl opacity-20 burn-effect">⏰</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm sm:text-base font-semibold text-[#F8FAFC]">⏰ Trading Status</h3>
                    <span className="px-2 sm:px-3 py-1 bg-[#EC4899]/10 rounded-full text-[10px] sm:text-xs text-[#EC4899] font-bold w-fit">15/20 NFTs</span>
                </div>
                <ProgressBar value={15} max={20} showPercentage={false} size="md" />
                <p className="text-[10px] sm:text-xs text-[#64748B] mt-2 sm:mt-3">
                    🔥 Complete <span className="text-[#EC4899] font-bold">75%</span> trading within 24 hours
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                {[
                    { icon: '🛒', label: 'Buy', color: '#EC4899' },
                    { icon: '💸', label: 'Withdraw', color: '#10B981' },
                    { icon: '👥', label: 'Invite', color: '#3B82F6' },
                    { icon: '📊', label: 'Reports', color: '#D946EF' },
                ].map((action, index) => (
                    <button
                        key={index}
                        className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] hover:border-[#EC4899]/50 transition-all duration-300 card-hover group active:scale-95"
                    >
                        <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-300">{action.icon}</span>
                        <span className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC] font-medium">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="p-3 sm:p-4 border-b border-[#334155] flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-[#F8FAFC]">📋 Recent Activity</h3>
                    <span className="text-[10px] sm:text-xs text-[#3B82F6] cursor-pointer hover:underline">View All</span>
                </div>
                <div className="divide-y divide-[#334155]">
                    {[
                        { type: 'Earned', amount: '+$2.50', desc: 'Level 3 income', time: '2 min ago', color: '#10B981', icon: '💰' },
                        { type: 'Bought', amount: '-$25', desc: 'NFT #ABC123', time: '1 hour ago', color: '#D946EF', icon: '🛒' },
                        { type: 'Earned', amount: '+$25.75', desc: 'Burn reward', time: '3 hours ago', color: '#10B981', icon: '🔥' },
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1E293B]/50 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-base sm:text-xl">
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-[#F8FAFC] font-medium">{activity.type}</p>
                                    <p className="text-[10px] sm:text-xs text-[#64748B]">{activity.desc}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs sm:text-sm font-mono font-bold" style={{ color: activity.color }}>{activity.amount}</p>
                                <p className="text-[8px] sm:text-[10px] text-[#64748B]">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
