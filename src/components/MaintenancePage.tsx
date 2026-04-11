'use client'

import { MAINTENANCE_CONFIG } from '@/config/constants'

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 md:p-4">
            <div className="max-w-2xl w-full">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Maintenance Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-pink-500/30 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-12 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-5 md:mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl md:blur-2xl animate-pulse" />
                            <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-4 md:p-6 rounded-full">
                                <div className="text-3xl md:text-5xl animate-bounce">🔧</div>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
                        {MAINTENANCE_CONFIG.title}
                    </h1>

                    {/* Message */}
                    <p className="text-slate-300 text-center text-sm md:text-base lg:text-lg mb-5 md:mb-8 leading-relaxed px-2">
                        {MAINTENANCE_CONFIG.message}
                    </p>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-8">
                        {/* Estimated Time */}
                        <div className="bg-slate-800/50 border border-pink-500/20 rounded-lg md:rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
                            <div className="text-xl md:text-2xl flex-shrink-0">⏰</div>
                            <div>
                                <div className="text-xs md:text-sm text-slate-400 mb-0.5 md:mb-1">Estimated Time</div>
                                <div className="text-white text-sm md:text-base font-semibold">{MAINTENANCE_CONFIG.estimatedTime}</div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-slate-800/50 border border-pink-500/20 rounded-lg md:rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
                            <div className="text-xl md:text-2xl flex-shrink-0">⚠️</div>
                            <div>
                                <div className="text-xs md:text-sm text-slate-400 mb-0.5 md:mb-1">Status</div>
                                <div className="text-white text-sm md:text-base font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full animate-pulse" />
                                    In Progress
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg md:rounded-xl p-4 md:p-6">
                        <h3 className="text-white text-sm md:text-base font-semibold mb-2 md:mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-pink-500 rounded-full flex-shrink-0" />
                            What's happening?
                        </h3>
                        <ul className="text-slate-300 space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-pink-500 mt-0.5 md:mt-1 flex-shrink-0">•</span>
                                <span>Integrating emerging blockchain technology for lightning-fast transactions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-500 mt-0.5 md:mt-1 flex-shrink-0">•</span>
                                <span>Upgrading to next-generation infrastructure for instant page loading</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-500 mt-0.5 md:mt-1 flex-shrink-0">•</span>
                                <span>Optimizing smart contract execution for seamless user experience</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 md:mt-8 text-center">
                        <p className="text-slate-400 text-xs md:text-sm">
                            Thank you for your patience! 
                            <span className="block mt-1.5 md:mt-2 text-pink-500 text-sm md:text-base font-semibold">
                                Your funds are safe and secure. ✓
                            </span>
                        </p>
                    </div>
                </div>

                {/* Animated Bull Logo (Optional) */}
                <div className="mt-5 md:mt-8 text-center">
                    <div className="inline-block text-4xl md:text-6xl animate-bounce">
                        🐂
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2">BullRun Platform</p>
                </div>
            </div>
        </div>
    )
}
