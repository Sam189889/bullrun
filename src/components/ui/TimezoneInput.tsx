'use client';

import { useState } from 'react';

interface TimezoneInputProps {
    value: string;
    onChange: (timestamp: string) => void;
    label?: string;
    description?: string;
}

// Timezone offsets in seconds from UTC
const TIMEZONES = [
    { label: '🇮🇳 India (IST, UTC+5:30)', offset: 19800 },
    { label: '🇦🇪 Dubai (GST, UTC+4:00)', offset: 14400 },
    { label: '🇬🇧 London (GMT, UTC+0:00)', offset: 0 },
    { label: '🇺🇸 New York (EST, UTC-5:00)', offset: -18000 },
    { label: '🇺🇸 Los Angeles (PST, UTC-8:00)', offset: -28800 },
    { label: '🇯🇵 Tokyo (JST, UTC+9:00)', offset: 32400 },
    { label: '🇨🇳 China (CST, UTC+8:00)', offset: 28800 },
    { label: '🇸🇬 Singapore (SGT, UTC+8:00)', offset: 28800 },
    { label: '🇦🇺 Sydney (AEST, UTC+10:00)', offset: 36000 },
    { label: '🇷🇺 Moscow (MSK, UTC+3:00)', offset: 10800 },
];

export function TimezoneInput({ value, onChange, label = "Quick Select Timezone", description = "Sets today's midnight in selected timezone" }: TimezoneInputProps) {
    const [selectedOffset, setSelectedOffset] = useState<number | null>(null);

    const handleTimezoneSelect = (offsetStr: string) => {
        if (!offsetStr) return;
        const offsetSeconds = parseInt(offsetStr);
        setSelectedOffset(offsetSeconds);

        // Get today's date at midnight UTC
        const now = new Date();
        const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);
        // Adjust for timezone: midnight in that timezone = UTC midnight - offset
        // e.g., for India (UTC+5:30), midnight IST = UTC midnight - 5:30 hours
        const localMidnight = Math.floor(utcMidnight / 1000) - offsetSeconds;
        onChange(localMidnight.toString());
    };

    const handleUseNow = () => {
        const now = Math.floor(Date.now() / 1000);
        onChange(now.toString());
    };

    const handleSetMidnight = () => {
        if (!value) return;
        const ts = parseInt(value);
        const date = new Date(ts * 1000);
        // Adjust to midnight preserving the timezone offset
        if (selectedOffset !== null) {
            const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
            const localMidnight = Math.floor(utcMidnight / 1000) - selectedOffset;
            onChange(localMidnight.toString());
        } else {
            date.setHours(0, 0, 0, 0);
            onChange(Math.floor(date.getTime() / 1000).toString());
        }
    };

    const handleSetNoon = () => {
        if (!value) return;
        const ts = parseInt(value);
        const date = new Date(ts * 1000);
        // Adjust to noon preserving the timezone offset
        if (selectedOffset !== null) {
            const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
            const localNoon = Math.floor(utcMidnight / 1000) - selectedOffset + 43200; // +12 hours
            onChange(localNoon.toString());
        } else {
            date.setHours(12, 0, 0, 0);
            onChange(Math.floor(date.getTime() / 1000).toString());
        }
    };

    const handlePreviousDay = () => {
        if (!value) return;
        const ts = parseInt(value) - 86400;
        onChange(ts.toString());
    };

    const handleNextDay = () => {
        if (!value) return;
        const ts = parseInt(value) + 86400;
        onChange(ts.toString());
    };

    return (
        <div className="space-y-3">
            {/* Timezone Selector */}
            <div>
                <label className="text-xs text-[#94A3B8] block mb-1">{label}</label>
                <p className="text-[10px] text-[#64748B] mb-2">{description}</p>
                <select
                    onChange={(e) => handleTimezoneSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                >
                    <option value="">Select Country/Timezone</option>
                    {TIMEZONES.map((tz) => (
                        <option key={tz.label} value={tz.offset.toString()}>
                            {tz.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Time Adjustment Buttons */}
            <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Adjust Time (Optional)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={handleSetMidnight}
                        disabled={!value}
                        className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🌙 Set to Midnight (12:00 AM)
                    </button>
                    <button
                        onClick={handleSetNoon}
                        disabled={!value}
                        className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#F59E0B] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ☀️ Set to Noon (12:00 PM)
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handlePreviousDay}
                        disabled={!value}
                        className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ⬅️ Previous Day (-24h)
                    </button>
                    <button
                        onClick={handleNextDay}
                        disabled={!value}
                        className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Day (+24h) ➡️
                    </button>
                </div>
            </div>

            {/* Timestamp Input */}
            <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Start Timestamp (Unix)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="1737565800"
                        className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                    />
                    <button
                        onClick={handleUseNow}
                        className="px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white text-xs rounded-lg"
                    >
                        Now
                    </button>
                </div>
                {value && (
                    <p className="text-[10px] text-[#10B981] mt-1">
                        📅 {new Date(parseInt(value) * 1000).toLocaleString('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'long'
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}
