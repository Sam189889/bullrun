'use client';

import { mockLevelIncome, levelEligibility } from '@/lib/mockData';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function LevelsTab() {
    const currentLevel = 6;
    const directReferrals = 4;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Current Status */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#8B5CF6]/20 via-[#1E293B] to-[#EC4899]/20 rounded-xl p-4 sm:p-5 border border-[#8B5CF6]/30 animate-slide-up">
                <div className="absolute top-2 right-4 text-4xl sm:text-5xl opacity-10 float-slow">📈</div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                        <p className="text-[10px] sm:text-xs text-[#64748B]">Current Level</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#8B5CF6]">{currentLevel}<span className="text-sm sm:text-lg text-[#64748B]">/15</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-[#64748B]">Next Unlock</p>
                        <p className="text-xs sm:text-sm text-[#F8FAFC]">Need <span className="text-[#EC4899] font-bold">{6 - directReferrals}</span> more</p>
                    </div>
                </div>
                <ProgressBar value={currentLevel} max={15} showPercentage={false} size="md" />
            </div>

            {/* Eligibility Chart */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 sm:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🔓</span> Level Unlock Requirements
                </h3>
                <div className="space-y-2 sm:space-y-3">
                    {levelEligibility.map((item, index) => (
                        <div key={index} className={`
              flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all
              ${item.referrals <= directReferrals
                                ? 'bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/30'
                                : 'bg-[#0F172A] border border-[#334155]'
                            }
            `}>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`
                  w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold
                  ${item.referrals <= directReferrals
                                        ? 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                        : 'bg-[#334155] text-[#64748B]'
                                    }
                `}>
                                    {item.referrals}
                                </div>
                                <span className="text-[10px] sm:text-sm text-[#94A3B8]">Referrals</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className={`text-sm sm:text-lg font-bold ${item.referrals <= directReferrals ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                                    {item.levels} <span className="text-[8px] sm:text-xs font-normal">Levels</span>
                                </span>
                                {item.referrals <= directReferrals && (
                                    <span className="text-[#10B981] text-base sm:text-xl">✓</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Level Income Table */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155] overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-3 sm:p-4 border-b border-[#334155]">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                        <span className="text-lg sm:text-xl">📊</span> Income Breakdown
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-[#0F172A]">
                            <tr>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Level</th>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Rate</th>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Today</th>
                                <th className="text-left p-3 sm:p-4 text-[#64748B] font-medium text-[10px] sm:text-xs">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {mockLevelIncome.slice(0, 6).map((level, index) => (
                                <tr key={level.level} className={`hover:bg-[#1E293B]/50 transition-colors ${index < currentLevel ? '' : 'opacity-50'}`}>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className={`
                        w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-xs font-bold
                        ${index < currentLevel ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#334155] text-[#64748B]'}
                      `}>
                                                {level.level}
                                            </span>
                                            <span className="text-[10px] sm:text-sm text-[#F8FAFC]">L{level.level}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-[#EC4899] font-mono text-[10px] sm:text-sm">${level.ratePerNFT}</td>
                                    <td className="p-3 sm:p-4 text-[#10B981] font-mono text-[10px] sm:text-sm">+${level.todayIncome}</td>
                                    <td className="p-3 sm:p-4 text-[#F8FAFC] font-mono text-[10px] sm:text-sm">${level.totalIncome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
