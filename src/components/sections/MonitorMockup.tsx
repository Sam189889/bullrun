"use client";

interface MonitorMockupProps {
    videoSrc: string;
}

export function MonitorMockup({ videoSrc }: MonitorMockupProps) {
    return (
        <div className="relative w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
            {/* Monitor Frame */}
            <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-xl p-2 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">

                {/* Screen Bezel */}
                <div className="bg-black rounded-lg overflow-hidden">
                    {/* Screen */}
                    <div className="relative aspect-video">
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

                        {/* Screen Glare */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Webcam Dot */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-700 rounded-full">
                    <div className="absolute inset-0.5 bg-slate-800 rounded-full" />
                </div>
            </div>

            {/* Stand Neck */}
            <div className="mx-auto w-20 h-8 bg-gradient-to-b from-slate-800 to-slate-900" />

            {/* Stand Base */}
            <div className="mx-auto w-40 h-3 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full shadow-lg" />

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse" />
                <div className="absolute inset-0 blur-xl opacity-30 bg-black translate-y-10" />
            </div>
        </div>
    );
}
