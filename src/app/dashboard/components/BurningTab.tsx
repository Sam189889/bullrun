'use client';

import { mockBurningWallet, deductionRules } from '@/lib/mockData';

export function BurningTab() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                    { icon: '💰', label: 'Balance', value: `$${mockBurningWallet.currentBalance}`, color: '#EC4899' },
                    { icon: '🔥', label: 'Burned', value: `$${mockBurningWallet.totalBurned}`, color: '#EF4444', animate: true },
                    { icon: '➖', label: 'Deducted', value: `$${mockBurningWallet.totalDeducted}`, color: '#D946EF' },
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
                        <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl opacity-20 ${stat.animate ? 'burn-effect' : 'float-slow'}`}>{stat.icon}</div>
                        <p className="text-[8px] sm:text-xs text-[#64748B]">{stat.label}</p>
                        <p className="text-base sm:text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Burning Flow */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 sm:p-5 md:p-6 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EF4444]/5 to-transparent" />
                <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-4 sm:mb-5 flex items-center gap-2">
                    <span className="text-lg sm:text-xl burn-effect">🔥</span> How Burning Works
                </h3>
                <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
                    {[
                        { icon: '💰', label: '$50', color: '#EC4899' },
                        { icon: '➡️', label: '' },
                        { icon: '🔥', label: 'Burn', color: '#EF4444', animate: true },
                        { icon: '➡️', label: '' },
                        { icon: '🪙', label: '3×$25', color: '#D946EF' },
                        { icon: '➡️', label: '' },
                        { icon: '💎', label: '$25.75', color: '#10B981', glow: true },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center min-w-[40px] sm:min-w-[50px]">
                            <span className={`
                text-lg sm:text-2xl md:text-3xl 
                ${step.animate ? 'burn-effect' : ''} 
                ${step.glow ? 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}
              `}>
                                {step.icon}
                            </span>
                            {step.label && (
                                <span className="text-[8px] sm:text-xs mt-0.5 sm:mt-1 font-medium" style={{ color: step.color || '#64748B' }}>
                                    {step.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Deduction Rules */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="p-3 sm:p-4 border-b border-[#334155]">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">📋 Deduction Rules</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-[#0F172A]">
                            <tr>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Package</th>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Threshold</th>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Deduction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {deductionRules.map((rule, index) => (
                                <tr key={index} className="hover:bg-[#1E293B]/50 transition-colors">
                                    <td className="p-3 sm:p-4 text-[#F8FAFC] font-medium text-[10px] sm:text-sm">{rule.package}</td>
                                    <td className="p-3 sm:p-4 text-[#EC4899] font-mono text-[10px] sm:text-sm">${rule.threshold}</td>
                                    <td className="p-3 sm:p-4 text-[#EF4444] font-mono text-[10px] sm:text-sm">${rule.deduction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Alert */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#10B981]/20 to-[#1E293B] border border-[#10B981]/30 rounded-xl p-3 sm:p-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="absolute top-1 right-2 sm:top-2 sm:right-4 text-2xl sm:text-3xl opacity-20">💡</div>
                <p className="text-[10px] sm:text-sm text-[#10B981]">
                    <strong>💡 Tip:</strong> Every $50 NFT burn = <span className="text-[#EC4899] font-bold">$25.75</span> reward!
                </p>
            </div>
        </div>
    );
}
