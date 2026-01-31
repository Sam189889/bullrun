'use client';

import { useState, useEffect, useRef } from 'react';
import { useGetCurrentWeek, useWeekStartTimestamp, useSetWeekStartTimestamp, useStartNewWeek } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function WeekManagement() {
    const { data: currentWeek, refetch: refetchWeek } = useGetCurrentWeek();
    const { data: weekStartTimestamp, refetch: refetchTimestamp } = useWeekStartTimestamp();

    const [startTimestamp, setStartTimestamp] = useState('');
    const toastShown1 = useRef(false);
    const toastShown2 = useRef(false);

    const { setStartTimestamp: setWeekStart, isPending: pending1, isConfirming: confirming1, isSuccess: success1 } = useSetWeekStartTimestamp();
    const { startNewWeek, isPending: pending2, isConfirming: confirming2, isSuccess: success2 } = useStartNewWeek();

    const isAutoMode = typeof weekStartTimestamp === 'bigint' && weekStartTimestamp > BigInt(0);

    useEffect(() => {
        if (success1 && !toastShown1.current) {
            toastShown1.current = true;
            toast.success('Week auto mode enabled!');
            refetchWeek();
            refetchTimestamp();
            setStartTimestamp('');
        }
    }, [success1, refetchWeek, refetchTimestamp]);

    useEffect(() => {
        if (success2 && !toastShown2.current) {
            toastShown2.current = true;
            toast.success('New week started!');
            refetchWeek();
            refetchTimestamp();
        }
    }, [success2, refetchWeek, refetchTimestamp]);

    const handleSetAutoMode = () => {
        if (!startTimestamp) {
            toast.error('Please set a start timestamp');
            return;
        }
        toastShown1.current = false;
        setWeekStart(BigInt(startTimestamp));
    };

    const handleStartManualWeek = () => {
        toastShown2.current = false;
        startNewWeek();
    };

    const handleUseNow = () => {
        const now = Math.floor(Date.now() / 1000);
        setStartTimestamp(now.toString());
    };

    const handleSetMidnight = () => {
        if (!startTimestamp) return;
        const ts = parseInt(startTimestamp);
        const date = new Date(ts * 1000);
        date.setHours(0, 0, 0, 0);
        setStartTimestamp(Math.floor(date.getTime() / 1000).toString());
    };

    const handleSetNoon = () => {
        if (!startTimestamp) return;
        const ts = parseInt(startTimestamp);
        const date = new Date(ts * 1000);
        date.setHours(12, 0, 0, 0);
        setStartTimestamp(Math.floor(date.getTime() / 1000).toString());
    };

    const handlePreviousWeek = () => {
        if (!startTimestamp) return;
        const ts = parseInt(startTimestamp) - 86400; // -1 day
        setStartTimestamp(ts.toString());
    };

    const handleNextWeek = () => {
        if (!startTimestamp) return;
        const ts = parseInt(startTimestamp) + 86400; // +1 day
        setStartTimestamp(ts.toString());
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">📅 Initialize Week Settings</h3>
            <p className="text-xs text-[#64748B] mb-2">
                Required for weekly pools. Week 1 start timestamp for auto-calculating weeks.
            </p>
            <p className="text-xs text-[#F59E0B] mb-4">⚠️ Run this once after deployment</p>

            {/* Current Week Status */}
            {Boolean(isAutoMode) && (
                <div className="p-3 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg mb-4">
                    <p className="text-xs text-[#EC4899] font-bold mb-2">📅 Current Settings (Active)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Week 1 Start</p>
                            <p className="text-xs text-[#F8FAFC] font-mono">
                                {new Date(Number(weekStartTimestamp) * 1000).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Current Week</p>
                            <p className="text-xs text-[#10B981] font-bold">
                                Week {currentWeek ? Number(currentWeek) : '0'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {Boolean(!isAutoMode) && Boolean(currentWeek) && Number(currentWeek) > 0 && (
                <div className="p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg mb-4">
                    <p className="text-xs text-[#3B82F6] font-bold mb-1">✋ Manual Mode (Active)</p>
                    <p className="text-xs text-[#F8FAFC]">
                        Current Week: <span className="font-bold">Week {Number(currentWeek)}</span>
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {/* Quick Select Timezone */}
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Quick Select Timezone</label>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                const offset = parseInt(e.target.value);
                                const now = Math.floor(Date.now() / 1000);
                                setStartTimestamp((now + offset).toString());
                            }
                        }}
                        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-sm focus:border-[#EC4899] outline-none"
                    >
                        <option value="">Select Timezone</option>
                        <option value="19800">🇮🇳 India (IST, UTC+5:30)</option>
                        <option value="14400">🇦🇪 Dubai (GST, UTC+4:00)</option>
                        <option value="0">🇬🇧 London (GMT, UTC+0:00)</option>
                        <option value="-18000">🇺🇸 New York (EST, UTC-5:00)</option>
                        <option value="28800">🇬 Singapore (SGT, UTC+8:00)</option>
                    </select>
                </div>

                {/* Adjust Time (Optional) */}
                <div>
                    <label className="text-xs text-[#94A3B8] block mb-1">Adjust Time (Optional)</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                            onClick={handleSetMidnight}
                            disabled={!startTimestamp}
                            className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🌙 Set to Midnight (12:00 AM)
                        </button>
                        <button
                            onClick={handleSetNoon}
                            disabled={!startTimestamp}
                            className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#F59E0B] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ☀️ Set to Noon (12:00 PM)
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handlePreviousWeek}
                            disabled={!startTimestamp}
                            className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-xs hover:border-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ⬅️ Previous Day (-24h)
                        </button>
                        <button
                            onClick={handleNextWeek}
                            disabled={!startTimestamp}
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
                            value={startTimestamp}
                            onChange={(e) => setStartTimestamp(e.target.value)}
                            placeholder="1737565800"
                            className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                        />
                        <Button variant="secondary" size="sm" onClick={handleUseNow}>
                            Now
                        </Button>
                    </div>
                    {startTimestamp && (
                        <p className="text-[10px] text-[#10B981] mt-1">
                            📅 {new Date(parseInt(startTimestamp) * 1000).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSetAutoMode}
                    disabled={pending1 || confirming1 || !startTimestamp}
                    className="w-full"
                >
                    {pending1 || confirming1 ? 'Initializing...' : '✨ Initialize Week Settings'}
                </Button>
            </div>

            {/* Manual Week Section */}
            <div className="mt-6 pt-4 border-t border-[#334155]">
                <h4 className="text-sm text-[#F8FAFC] font-semibold mb-2">✋ Manual Mode</h4>
                <p className="text-xs text-[#64748B] mb-3">
                    Manually start new week. Resets shares & switches to manual mode.
                    <span className="block mt-1 text-[#EF4444]">⚠️ This will disable auto mode!</span>
                </p>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={handleStartManualWeek}
                    disabled={pending2 || confirming2}
                    className="w-full"
                >
                    {pending2 || confirming2 ? 'Starting...' : '🚀 Start New Week (Manual)'}
                </Button>
            </div>
        </Card>
    );
}
