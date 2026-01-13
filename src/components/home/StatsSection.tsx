export function StatsSection() {
    const stats = [
        { value: '$125M+', label: 'Total Volume' },
        { value: '15K+', label: 'Active Traders' },
        { value: '50K+', label: 'NFTs Traded' },
        { value: '$25.75', label: 'Burn Reward' },
    ];

    return (
        <section className="py-12 bg-[#0F172A]">
            <div className="container-app">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="glass-card p-4 text-center">
                            <p className="text-3xl font-bold text-[#EC4899] font-mono">{stat.value}</p>
                            <p className="text-sm text-[#94A3B8]">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
