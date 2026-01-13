'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    { icon: '🛒', label: 'NFT Marketplace', href: '/dashboard/marketplace' },
    { icon: '💰', label: 'My Earnings', href: '/dashboard/earnings' },
    { icon: '👥', label: 'Team & Referrals', href: '/dashboard/team' },
    { icon: '🔥', label: 'Burning Wallet', href: '/dashboard/burning' },
    { icon: '📈', label: 'Level Income', href: '/dashboard/levels' },
    { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-26 bottom-0 w-64 bg-[#0F172A] border-r border-[#334155] overflow-y-auto">
            <div className="p-4">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-gradient-to-r from-[#EC4899]/20 to-transparent border-l-4 border-[#EC4899] text-[#EC4899]'
                                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                                    }
                `}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="mt-8 pt-4 border-t border-[#334155]">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
                        <span className="text-xl">🚪</span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
