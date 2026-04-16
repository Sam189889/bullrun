'use client';

import { useState } from 'react';
import { useIsAdmin } from '@/hooks';
import { WalletConnect } from '@/components';
import { ADMIN_WALLETS } from '@/config';
import {
    AdminHeader,
    AdminNav,
    OverviewTab,
    UsersTab,
    PackagesTab,
    SettingsTab,
    WeeklyPoolTab,
    NFTsTab,
} from './components';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminActiveTab') || 'overview';
        }
        return 'overview';
    });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isAdmin, address, isConnected } = useIsAdmin();

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            if (typeof window !== 'undefined') {
                localStorage.setItem('adminActiveTab', tab);
            }
            setIsTransitioning(false);
        }, 150);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'users':
                return <UsersTab />;
            case 'packages':
                return <PackagesTab />;
            case 'settings':
                return <SettingsTab />;
            case 'weekly':
                return <WeeklyPoolTab />;
            case 'nfts':
                return <NFTsTab />;
            default:
                return <OverviewTab />;
        }
    };

    // Show connect wallet screen if not connected
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-[#EF4444]/5 rounded-full blur-3xl float-slow" />
                    <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#D946EF]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />
                </div>

                {/* Connect Wallet Card */}
                <div className="relative z-10 text-center p-6 sm:p-8 md:p-10 animate-slide-up">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)] float-slow">
                        <span className="text-3xl sm:text-4xl">🛡️</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                        <span className="bg-gradient-to-r from-[#EF4444] to-[#D946EF] bg-clip-text text-transparent">Admin Panel</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#64748B] mb-6 sm:mb-8">Connect your wallet to access admin controls</p>

                    {/* RainbowKit Connect Button */}
                    <WalletConnect />

                    <p className="text-[10px] sm:text-xs text-[#475569] mt-4 sm:mt-6">
                        Admin access required
                    </p>
                </div>
            </div>
        );
    }

    // Show access denied if connected but not admin
    if (isConnected && !isAdmin) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-[#EF4444]/5 rounded-full blur-3xl float-slow" />
                    <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#D946EF]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                </div>

                {/* Access Denied Card */}
                <div className="relative z-10 text-center p-6 sm:p-8 md:p-10 max-w-md">
                    {/* Icon */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                        <span className="text-3xl sm:text-4xl">🚫</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F8FAFC] mb-2">
                        <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">Access Denied</span>
                    </h1>
                    <p className="text-sm text-[#94A3B8] mb-4">
                        Your wallet is not authorized to access admin panel.
                    </p>
                    <p className="text-xs text-[#64748B] mb-6 font-mono break-all">
                        Connected: {address}
                    </p>

                    {/* Disconnect and try another wallet */}
                    <WalletConnect />

                    <div className="mt-6 p-4 bg-[#1E293B]/50 rounded-xl border border-[#334155]">
                        <p className="text-xs text-[#64748B] mb-2">Authorized wallets:</p>
                        {ADMIN_WALLETS.map((wallet, idx) => (
                            <p key={idx} className="text-[10px] font-mono text-[#475569] truncate">
                                {wallet}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-64 h-64 bg-[#EF4444]/5 rounded-full blur-3xl float-slow" />
                <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#D946EF]/5 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-3xl float-fast" style={{ animationDelay: '1s' }} />
            </div>

            {/* Fixed Header */}
            <AdminHeader />

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
            <AdminNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
    );
}
