'use client';

const packages = [
    { fee: 15, nftValue: 175, users: 1234, revenue: 18510, active: true },
    { fee: 25, nftValue: 250, users: 2345, revenue: 58625, active: true },
    { fee: 50, nftValue: 500, users: 1567, revenue: 78350, active: true },
    { fee: 100, nftValue: 1000, users: 890, revenue: 89000, active: true },
    { fee: 200, nftValue: 2000, users: 456, revenue: 91200, active: true },
    { fee: 400, nftValue: 4000, users: 234, revenue: 93600, active: true },
    { fee: 600, nftValue: 6000, users: 123, revenue: 73800, active: true },
    { fee: 800, nftValue: 8000, users: 67, revenue: 53600, active: true },
    { fee: 1000, nftValue: 10000, users: 45, revenue: 45000, active: true },
];

export function PackagesTab() {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 animate-slide-up">
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F8FAFC]">📦 Packages</h2>
                    <p className="text-[10px] sm:text-xs text-[#64748B]">{packages.length} packages</p>
                </div>
                <button className="w-fit px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-lg text-[10px] sm:text-sm font-bold text-[#0F172A] active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                    + Add Package
                </button>
            </div>

            {/* Package Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                {packages.map((pkg, index) => (
                    <div
                        key={index}
                        className={`
              relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 border animate-slide-up card-hover group
              ${pkg.fee >= 200
                                ? 'bg-gradient-to-br from-[#EC4899]/20 to-[#1E293B] border-[#EC4899]/30'
                                : 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]'
                            }
            `}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {pkg.fee === 100 && (
                            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#10B981] rounded-full text-[6px] sm:text-[8px] font-bold text-white">
                                Popular
                            </div>
                        )}
                        {pkg.fee === 1000 && (
                            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-full text-[6px] sm:text-[8px] font-bold text-[#0F172A]">
                                Premium
                            </div>
                        )}

                        <p className="text-sm sm:text-lg md:text-xl font-bold text-[#EC4899] mb-0.5 group-hover:scale-105 transition-transform">${pkg.fee}</p>
                        <p className="text-[7px] sm:text-[8px] md:text-[10px] text-[#64748B] mb-1 sm:mb-2">NFT: ${pkg.nftValue}</p>

                        <div className="space-y-0.5 sm:space-y-1 pt-1 sm:pt-2 border-t border-[#334155]">
                            <div className="flex justify-between text-[7px] sm:text-[8px] md:text-[10px]">
                                <span className="text-[#64748B]">Users</span>
                                <span className="text-[#F8FAFC]">{pkg.users.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[7px] sm:text-[8px] md:text-[10px]">
                                <span className="text-[#64748B]">Rev</span>
                                <span className="text-[#10B981]">${(pkg.revenue / 1000).toFixed(0)}K</span>
                            </div>
                        </div>

                        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#334155] flex gap-0.5 sm:gap-1">
                            <button className="flex-1 py-0.5 sm:py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-[7px] sm:text-[8px] hover:bg-[#3B82F6]/30 transition-colors active:scale-95">
                                Edit
                            </button>
                            <button className={`flex-1 py-0.5 sm:py-1 rounded text-[7px] sm:text-[8px] transition-colors active:scale-95 ${pkg.active ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                {pkg.active ? '✓' : '✗'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Summary */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#F8FAFC] mb-3 sm:mb-4">💰 Revenue Summary</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                        { label: 'Total Revenue', value: `$${(packages.reduce((a, b) => a + b.revenue, 0) / 1000).toFixed(0)}K`, color: '#10B981' },
                        { label: 'Total Users', value: packages.reduce((a, b) => a + b.users, 0).toLocaleString(), color: '#3B82F6' },
                        { label: 'Most Popular', value: '$100', color: '#EC4899' },
                    ].map((item, i) => (
                        <div key={i} className={`text-center ${i === 1 ? 'border-x border-[#334155]' : ''}`}>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-[#64748B]">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
