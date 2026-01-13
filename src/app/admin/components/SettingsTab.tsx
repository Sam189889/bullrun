'use client';

import { useState } from 'react';

export function SettingsTab() {
    const [settings, setSettings] = useState({
        tradingActive: true,
        burnRewardAmount: 25.75,
        minNFTDisplay: 10,
        tradingTimeLimit: 24,
        deductionThreshold15: 60,
        deductionThreshold25: 80,
        deductionThreshold50: 100,
        deductionAmount: 10,
    });

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F8FAFC]">⚙️ Settings</h2>
                <p className="text-[10px] sm:text-xs text-[#64748B]">Platform configuration</p>
            </div>

            {/* General Settings */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#F8FAFC] mb-3 sm:mb-4">🔧 General</h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {/* Trading Toggle */}
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0F172A] rounded-lg">
                        <div>
                            <p className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC]">Trading Status</p>
                            <p className="text-[8px] sm:text-[10px] text-[#64748B]">Enable trading</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, tradingActive: !settings.tradingActive })}
                            className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 ${settings.tradingActive ? 'bg-[#10B981]' : 'bg-[#334155]'}`}
                        >
                            <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white transition-transform duration-300 ${settings.tradingActive ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Settings Inputs */}
                    {[
                        { label: 'Burn Reward', desc: 'Per $50 NFT', key: 'burnRewardAmount', value: settings.burnRewardAmount, color: '#EC4899' },
                        { label: 'Min NFTs', desc: 'Display count', key: 'minNFTDisplay', value: settings.minNFTDisplay, color: '#3B82F6' },
                        { label: 'Time Limit', desc: 'Hours for 75%', key: 'tradingTimeLimit', value: settings.tradingTimeLimit, color: '#D946EF' },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-[#0F172A] rounded-lg">
                            <div>
                                <p className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC]">{item.label}</p>
                                <p className="text-[8px] sm:text-[10px] text-[#64748B]">{item.desc}</p>
                            </div>
                            <input
                                type="number"
                                value={item.value}
                                onChange={(e) => setSettings({ ...settings, [item.key]: parseFloat(e.target.value) })}
                                className="w-16 sm:w-20 md:w-24 bg-[#1E293B] border border-[#334155] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm text-right font-mono"
                                style={{ color: item.color }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Deduction Settings */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-[#334155] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-[#F8FAFC] mb-3 sm:mb-4">🔥 Deductions</h3>
                <div className="space-y-2 sm:space-y-3">
                    {[
                        { label: '$15 Package', key: 'deductionThreshold15', value: settings.deductionThreshold15 },
                        { label: '$25 Package', key: 'deductionThreshold25', value: settings.deductionThreshold25 },
                        { label: '$50+ Package', key: 'deductionThreshold50', value: settings.deductionThreshold50 },
                        { label: 'Deduction Amt', key: 'deductionAmount', value: settings.deductionAmount },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-[#0F172A] rounded-lg">
                            <p className="text-[10px] sm:text-xs md:text-sm text-[#F8FAFC]">{item.label}</p>
                            <input
                                type="number"
                                value={item.value}
                                className="w-16 sm:w-20 md:w-24 bg-[#1E293B] border border-[#334155] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm text-[#EF4444] text-right font-mono"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <button className="w-full py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-lg sm:rounded-xl text-white font-bold text-xs sm:text-sm hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-98 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                💾 Save Settings
            </button>
        </div>
    );
}
