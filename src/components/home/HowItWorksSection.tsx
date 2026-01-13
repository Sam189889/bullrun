'use client';

const steps = [
    { step: 1, title: 'Register', description: 'Choose your package from $15 to $1000', icon: '📝', detail: 'NFT value up to $10K' },
    { step: 2, title: 'Buy NFTs', description: 'Purchase 75% of NFT value within 24 hours', icon: '🛒', detail: 'Stay active to earn' },
    { step: 3, title: 'Build Network', description: 'Refer traders and unlock up to 15 levels', icon: '👥', detail: '2×2 Matrix' },
    { step: 4, title: 'Earn Rewards', description: 'Get $25.75 for every burn plus level income', icon: '💎', detail: 'Passive income' },
];

export function HowItWorksSection() {
    return (
        <section className="py-16 sm:py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]" />

            <div className="container-app relative z-10 px-4">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16 animate-slide-up">
                    <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-[#D946EF]/10 text-[#D946EF] text-xs sm:text-sm font-medium mb-4">
                        Getting Started
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#F8FAFC]">How It </span>
                        <span className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] bg-clip-text text-transparent">Works</span>
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-sm sm:text-lg">
                        Start earning in just 4 simple steps
                    </p>
                </div>

                {/* Steps - Desktop */}
                <div className="hidden lg:block">
                    <div className="relative">
                        {/* Connection Line */}
                        <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent" />
                        <div className="absolute top-20 left-0 right-0 h-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#EC4899] to-[#D946EF] shimmer" style={{ width: '100%' }} />
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {steps.map((step, index) => (
                                <div key={index} className="relative group animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                                    {/* Step Circle */}
                                    <div className="relative mb-10">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(255,215,0,0.3)] group-hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-shadow duration-500 float-slow" style={{ animationDelay: `${index * 0.2}s` }}>
                                            {step.icon}
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0F172A] border-2 border-[#EC4899] flex items-center justify-center text-xs font-bold text-[#EC4899]">
                                            {step.step}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">{step.title}</h3>
                                        <p className="text-[#94A3B8] text-sm mb-3">{step.description}</p>
                                        <span className="inline-block px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-[#EC4899] text-xs font-medium">
                                            {step.detail}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Steps - Mobile/Tablet */}
                <div className="lg:hidden">
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#EC4899] via-[#D946EF] to-[#EC4899]" />

                        <div className="space-y-6">
                            {steps.map((step, index) => (
                                <div key={index} className="relative flex gap-4 sm:gap-6 pl-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {/* Circle */}
                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#EC4899] to-[#D946EF] flex items-center justify-center text-lg sm:text-2xl z-10 shadow-[0_0_20px_rgba(255,215,0,0.3)] float-slow" style={{ animationDelay: `${index * 0.2}s` }}>
                                        {step.icon}
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-[#1E293B] border border-[#334155] rounded-xl p-4 card-hover">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] sm:text-xs font-bold text-[#EC4899] bg-[#EC4899]/10 px-2 py-0.5 rounded">
                                                Step {step.step}
                                            </span>
                                            <span className="text-[10px] sm:text-xs text-[#64748B]">{step.detail}</span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] mb-1">{step.title}</h3>
                                        <p className="text-[#94A3B8] text-xs sm:text-sm">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
