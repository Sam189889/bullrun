'use client';

const navItems = [
    { icon: '🏠', label: 'Home', target: 'hero' },
    { icon: '🐂', label: 'About', target: 'titans' },
    { icon: '⚡', label: 'Tech', target: 'crofuer' },
    { icon: '✨', label: 'Features', target: 'features' },
    { icon: '�️', label: 'Roadmap', target: 'roadmap' },
    { icon: '🎯', label: 'Join', target: 'join' },
];

export function BottomNav() {
    const scrollToSection = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (targetId === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-[#0F172A]/95 backdrop-blur-xl border-t border-[rgba(255,255,255,0.1)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="container-app">
                    <div className="flex items-center justify-around h-14 sm:h-16 px-2">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToSection(item.target)}
                                className="flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-[#94A3B8] hover:text-[#EC4899] hover:bg-[#1E293B] transition-all duration-200 active:scale-95"
                            >
                                <span className="text-base sm:text-xl">{item.icon}</span>
                                <span className="text-[9px] sm:text-xs font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
