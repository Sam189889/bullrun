'use client';

interface DashboardNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', color: '#EC4899' },
    { id: 'packages', icon: '📦', label: 'Packages', color: '#D946EF' },
    { id: 'earnings', icon: '💰', label: 'Earnings', color: '#10B981' },
    { id: 'ranks', icon: '🏆', label: 'Ranks', color: '#F59E0B' },
    { id: 'team', icon: '👥', label: 'Team', color: '#3B82F6' },
    { id: 'levels', icon: '📈', label: 'Levels', color: '#8B5CF6' },
];

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Matching homepage header style - clean glassmorphism */}
            <div className="bg-[#0F172A]/80 backdrop-blur-xl border-t border-[rgba(255,255,255,0.08)]">
                <div className="container-app">
                    <div className="flex items-center justify-around h-16 sm:h-20 px-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`
                                    relative flex flex-col items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 group
                                    ${activeTab === item.id
                                        ? 'text-white'
                                        : 'text-[#64748B] hover:text-[#94A3B8]'
                                    }
                                `}
                            >
                                {/* Active glow effect - matching header button style */}
                                {activeTab === item.id && (
                                    <div
                                        className="absolute inset-0 rounded-xl opacity-15 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                                        style={{
                                            backgroundColor: item.color,
                                            boxShadow: `0 0 20px ${item.color}40`
                                        }}
                                    />
                                )}

                                {/* Top indicator line */}
                                {activeTab === item.id && (
                                    <div
                                        className="absolute -top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                )}

                                {/* Icon with glow on active */}
                                <span
                                    className={`text-xl sm:text-2xl relative z-10 transition-all duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`}
                                    style={activeTab === item.id ? { filter: `drop-shadow(0 0 8px ${item.color})` } : {}}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className={`text-[10px] sm:text-xs font-medium relative z-10 transition-colors duration-300`}
                                    style={activeTab === item.id ? { color: item.color } : {}}
                                >
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
