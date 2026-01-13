'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-[#0F172A] border-t border-[#1E293B]">
            {/* Main Footer */}
            <div className="container-app py-8 sm:py-12 px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center">
                                <span className="text-base sm:text-lg">💰</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">
                                BULL RUN NFT
                            </span>
                        </Link>
                        <p className="text-[#64748B] text-xs sm:text-sm max-w-xs mb-3 sm:mb-4">
                            Community-driven NFT trading platform with multi-level rewards.
                        </p>
                        <div className="flex gap-2 sm:gap-3">
                            {['🐦', '💬', '📱', '🌐'].map((icon, i) => (
                                <button key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-sm sm:text-lg hover:border-[#EC4899]/50 hover:bg-[#1E293B]/80 transition-all">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-[#F8FAFC] mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            {['Home', 'Register', 'Dashboard', 'Marketplace'].map((link) => (
                                <li key={link}>
                                    <Link href="#" className="text-[#64748B] hover:text-[#EC4899] transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-[#F8FAFC] mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            {['How It Works', 'FAQs', 'Terms', 'Privacy'].map((link) => (
                                <li key={link}>
                                    <Link href="#" className="text-[#64748B] hover:text-[#EC4899] transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#1E293B]">
                <div className="container-app py-4 sm:py-6 px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                        <p className="text-[#64748B] text-[10px] sm:text-sm text-center sm:text-left">
                            © 2026 Bull Run NFT. Community-Led Project.
                        </p>
                        <p className="text-[#EF4444] text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
                            <span>⚠️</span>
                            Trade at your own risk
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
