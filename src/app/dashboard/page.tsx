'use client';

import { useState } from 'react';
import {
    DashboardHeader,
    DashboardNav,
    HomeTab,
    MarketplaceTab,
    EarningsTab,
    TeamTab,
    BurningTab,
    LevelsTab,
} from './components';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTransitioning(false);
        }, 150);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <HomeTab />;
            case 'marketplace':
                return <MarketplaceTab />;
            case 'earnings':
                return <EarningsTab />;
            case 'team':
                return <TeamTab />;
            case 'burning':
                return <BurningTab />;
            case 'levels':
                return <LevelsTab />;
            default:
                return <HomeTab />;
        }
    };

    // Show connect wallet screen if not connected
    if (!isWalletConnected) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-[#EC4899]/5 rounded-full blur-3xl float-slow" />
                    <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#D946EF]/5 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />
                </div>

                {/* Connect Wallet Card */}
                <div className="relative z-10 text-center p-6 sm:p-8 md:p-10 animate-slide-up">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.3)] float-slow">
                        <span className="text-3xl sm:text-4xl">💰</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                        Welcome to <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">BULL RUN NFT</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748B] mb-6 sm:mb-8">Connect your wallet to access the dashboard</p>

                    {/* Connect Button */}
                    <button
                        onClick={() => setIsWalletConnected(true)}
                        className="group relative overflow-hidden inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-xl sm:rounded-2xl font-bold text-[#0F172A] text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-all duration-300 active:scale-95"
                    >
                        {/* Shimmer */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                        <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="relative z-10">Connect Wallet</span>
                    </button>

                    <p className="text-[10px] sm:text-xs text-[#475569] mt-4 sm:mt-6">
                        Supports MetaMask, WalletConnect & more
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-64 h-64 bg-[#EC4899]/5 rounded-full blur-3xl float-slow" />
                <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#D946EF]/5 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />
            </div>

            {/* Fixed Header */}
            <DashboardHeader />

            {/* Main Content */}
            <main className="relative z-10 pt-16 sm:pt-20 pb-20 sm:pb-24">
                <div className="container-app px-3 sm:px-4 py-4 sm:py-6">
                    <div
                        className={`
              transition-all duration-300 ease-out
              ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            `}
                    >
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Navigation */}
            <DashboardNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
    );
}
