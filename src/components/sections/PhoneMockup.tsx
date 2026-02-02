"use client";

interface PhoneMockupProps {
    videoSrc: string;
}

export function PhoneMockup({ videoSrc }: PhoneMockupProps) {
    return (
        <div className="relative w-[85vw] sm:w-full sm:max-w-xs mx-auto" style={{ perspective: '1000px' }}>
            {/* Ultra Thin Bezel Phone Frame */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] p-1 shadow-[0_20px_80px_rgba(0,0,0,0.6)] border-2 border-slate-700 transform hover:scale-105 transition-transform duration-500">

                {/* Frame Shine */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-500/20 via-transparent to-transparent pointer-events-none"></div>

                {/* Screen Container - Nearly Full Screen */}
                <div className="relative bg-black rounded-[1.8rem] overflow-hidden aspect-[9/19]">
                    {/* Video */}
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        controls
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Tiny Notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
                        <div className="w-16 h-5 bg-black rounded-full flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                        </div>
                    </div>

                    {/* Screen Glare */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                </div>

                {/* Home Indicator - Thin */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full"></div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r from-[#EC4899] via-[#EF4444] to-[#F59E0B] animate-pulse"></div>
                <div className="absolute inset-0 blur-xl opacity-40 bg-black translate-y-6"></div>
            </div>
        </div>
    );
}
