'use client';

export function OverviewTab() {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#EF4444]/20 via-[#1E293B] to-[#D946EF]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-[#EF4444]/30 animate-slide-up">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 text-4xl sm:text-5xl opacity-10 float-slow">🛡️</div>
                    <div className="absolute bottom-0 left-10 text-2xl sm:text-3xl opacity-10 float-medium">📊</div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-base sm:text-lg md:text-2xl font-bold text-[#F8FAFC] mb-0.5 sm:mb-1">
                        Admin <span className="bg-gradient-to-r from-[#EF4444] to-[#D946EF] bg-clip-text text-transparent">Dashboard</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs md:text-sm text-[#94A3B8]">Platform analytics and management</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                    { icon: '👥', label: 'Total Users', value: '15,234', change: '+12%', color: '#3B82F6' },
                    { icon: '💰', label: 'Total Volume', value: '$2.5M', change: '+8%', color: '#10B981' },
                    { icon: '🔥', label: 'NFTs Burned', value: '8,456', change: '+15%', color: '#EF4444' },
                    { icon: '📦', label: 'Active Pkgs', value: '4,521', change: '+5%', color: '#D946EF' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border card-hover animate-slide-up group"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            background: `linear-gradient(to bottom right, ${stat.color}15, #1E293B)`,
                            borderColor: `${stat.color}30`
                        }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                            <span className="text-[8px] sm:text-[10px] md:text-xs text-[#10B981]">{stat.change}</span>
                        </div>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[8px] sm:text-[10px] md:text-xs text-[#64748B]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Recent Users */}
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#334155] flex items-center justify-between">
                        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#F8FAFC]">👥 Recent Registrations</h3>
                        <span className="text-[8px] sm:text-[10px] md:text-xs text-[#3B82F6] cursor-pointer hover:underline">View All</span>
                    </div>
                    <div className="divide-y divide-[#334155]">
                        {[
                            { wallet: '0xabc...123', package: '$100', time: '2 min ago' },
                            { wallet: '0xdef...456', package: '$50', time: '15 min ago' },
                            { wallet: '0x789...abc', package: '$25', time: '1 hour ago' },
                        ].map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 hover:bg-[#1E293B]/50 transition-colors">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-xs sm:text-sm">👤</div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC] font-mono">{user.wallet}</p>
                                        <p className="text-[8px] sm:text-[10px] text-[#64748B]">{user.package}</p>
                                    </div>
                                </div>
                                <span className="text-[8px] sm:text-[10px] text-[#64748B]">{user.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <div className="p-2.5 sm:p-3 md:p-4 border-b border-[#334155] flex items-center justify-between">
                        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#F8FAFC]">💰 Recent Transactions</h3>
                        <span className="text-[8px] sm:text-[10px] md:text-xs text-[#10B981] cursor-pointer hover:underline">View All</span>
                    </div>
                    <div className="divide-y divide-[#334155]">
                        {[
                            { type: 'NFT Sale', amount: '+$25', time: '5 min ago', color: '#10B981' },
                            { type: 'Burn Reward', amount: '+$25.75', time: '30 min ago', color: '#EF4444' },
                            { type: 'Registration', amount: '+$100', time: '2 hours ago', color: '#D946EF' },
                        ].map((tx, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 hover:bg-[#1E293B]/50 transition-colors">
                                <div>
                                    <p className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC]">{tx.type}</p>
                                    <p className="text-[8px] sm:text-[10px] text-[#64748B]">{tx.time}</p>
                                </div>
                                <p className="text-xs sm:text-sm font-mono font-bold" style={{ color: tx.color }}>{tx.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                {[
                    { icon: '📈', label: 'Growth', value: '+24%', color: '#10B981' },
                    { icon: '⏰', label: 'Active Now', value: '1,234', color: '#3B82F6' },
                    { icon: '🔥', label: 'Burned Today', value: '156', color: '#EF4444' },
                ].map((item, i) => (
                    <div key={i} className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-[#334155] text-center card-hover">
                        <span className="text-lg sm:text-xl md:text-2xl">{item.icon}</span>
                        <p className="text-sm sm:text-lg md:text-xl font-bold mt-1" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[8px] sm:text-[10px] text-[#64748B]">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
