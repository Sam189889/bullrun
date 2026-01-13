'use client';

const features = [
    {
        icon: '💰',
        title: 'Multiple Packages',
        subtitle: '$15 - $1000',
        description: 'Choose from 9 registration packages with increasing NFT values and benefits',
        highlight: '9 Tiers',
    },
    {
        icon: '⏰',
        title: '24-Hour Trading',
        subtitle: '75% Requirement',
        description: 'Complete your trading within 24 hours to maintain your level income eligibility',
        highlight: 'Daily Active',
    },
    {
        icon: '📈',
        title: '15-Level Income',
        subtitle: '2×2 Matrix',
        description: 'Earn from 15 levels deep with our auto-fill matrix distribution system',
        highlight: '60% Distributed',
    },
    {
        icon: '🔥',
        title: 'Burn & Earn',
        subtitle: '$25.75 Reward',
        description: '$50 NFTs auto-burn into 3×$25 NFTs with guaranteed burn rewards',
        highlight: 'Auto Convert',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-16 sm:py-24 bg-[#0F172A] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #EC4899 1px, transparent 0)`,
                    backgroundSize: '30px 30px',
                }} />
            </div>

            <div className="container-app relative z-10 px-4">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16 animate-slide-up">
                    <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#1E3A8A]/30 text-[#3B82F6] text-xs sm:text-sm font-medium mb-4">
                        Platform Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#F8FAFC]">Why Choose </span>
                        <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Bull Run NFT?</span>
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-sm sm:text-lg px-4">
                        Everything you need for successful NFT trading with community rewards
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899]/0 via-[#EC4899]/10 to-[#D946EF]/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-2xl p-5 sm:p-6 h-full card-hover group-hover:border-[#EC4899]/30 transition-all duration-500">
                                {/* Highlight Badge */}
                                <div className="absolute -top-3 right-3 sm:right-4 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-[#EC4899] to-[#D946EF] rounded-full text-[10px] sm:text-xs font-bold text-[#0F172A]">
                                    {feature.highlight}
                                </div>

                                {/* Icon */}
                                <div className="mb-4 sm:mb-6 relative">
                                    <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <div className="absolute inset-0 blur-2xl bg-[#EC4899]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC] mb-1">{feature.title}</h3>
                                <p className="text-[#EC4899] text-xs sm:text-sm font-medium mb-2 sm:mb-3">{feature.subtitle}</p>
                                <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">{feature.description}</p>

                                {/* Learn More Link */}
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#334155]">
                                    <span className="text-[#3B82F6] text-xs sm:text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">
                                        Learn more
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
