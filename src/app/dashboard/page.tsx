'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUserId } from '@/hooks/useContracts';
import { WalletConnect } from '@/components';
import {
    DashboardHeader,
    DashboardNav,
    HomeTab,
    MarketplaceTab,
    EarningsTab,
    TeamTab,
    LuckyDrawTab,
    LevelsTab,
    RanksTab,
    PackagesTab,
} from './components';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Real wallet connection check
    const { isConnected, address } = useAccount();
    const { data: userId, isLoading: userLoading } = useUserId(address);

    // Check if user is registered
    const isRegistered = typeof userId === 'bigint' && userId > BigInt(0);

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
            case 'packages':
                return <PackagesTab />;
            case 'earnings':
                return <EarningsTab />;
            case 'ranks':
                return <RanksTab />;
            case 'team':
                return <TeamTab />;
            case 'luckydraw':
                return <LuckyDrawTab />;
            case 'levels':
                return <LevelsTab />;
            default:
                return <HomeTab />;
        }
    };

    // Show loading state
    if (isConnected && userLoading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.3)] animate-pulse">
                        <span className="text-3xl">🐂</span>
                    </div>
                    <p className="text-[#64748B]">Loading your data...</p>
                </div>
            </div>
        );
    }

    // Show connect wallet screen if not connected
    if (!isConnected) {
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
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.3)] float-slow">
                        <span className="text-3xl sm:text-4xl">�</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                        Welcome to <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">BULL RUN</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748B] mb-6 sm:mb-8">Connect your wallet to access the dashboard</p>

                    {/* Connect Button */}
                    <WalletConnect />

                    <p className="text-[10px] sm:text-xs text-[#475569] mt-4 sm:mt-6">
                        Supports MetaMask, WalletConnect & more
                    </p>
                </div>
            </div>
        );
    }

    // Show registration prompt if wallet connected but not registered
    if (isConnected && !isRegistered) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-[#EC4899]/5 rounded-full blur-3xl float-slow" />
                    <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#D946EF]/5 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />
                </div>

                {/* Registration Card */}
                <div className="relative z-10 text-center p-6 sm:p-8 md:p-10 animate-slide-up max-w-md">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.3)] float-slow">
                        <span className="text-3xl sm:text-4xl">🚀</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                        <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Get Started!</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748B] mb-4">You're not registered yet</p>

                    {/* Register Button */}
                    <a
                        href="/register"
                        className="group relative overflow-hidden inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-xl sm:rounded-2xl font-bold text-[#0F172A] text-sm sm:text-base md:text-lg shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-all duration-300 active:scale-95"
                    >
                        {/* Shimmer */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <span className="text-xl">📝</span>
                        <span className="relative z-10">Register Now</span>
                    </a>

                    {/* Switch Wallet */}
                    <div className="mt-4 pt-4 border-t border-[#334155]">
                        <p className="text-[10px] text-[#64748B] mb-2">Wrong wallet?</p>
                        <WalletConnect />
                    </div>

                    <p className="text-[10px] sm:text-xs text-[#475569] mt-4 sm:mt-6">
                        Buy a package to join the Bull Run community
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
