'use client';

import { useState, useEffect, useRef } from 'react';
import { useSetDaySettings, useDayStartTimestamp, useDayLength, useCurrentDay } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TimezoneInput } from '@/components/ui/TimezoneInput';
import toast from 'react-hot-toast';

export function DaySettings() {
    const [dayStartTimestamp, setDayStartTimestamp] = useState('');
    const [dayLength, setDayLength] = useState('86400');
    const toastShown = useRef(false);

    const { data: currentDayStart } = useDayStartTimestamp();
    const { data: currentDayLength } = useDayLength();
    const { data: currentDay } = useCurrentDay();

    const { setDaySettings, isPending, isConfirming, isSuccess, error } = useSetDaySettings();

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Day settings initialized!');
            setDayStartTimestamp('');
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to set day settings');
        }
    }, [isSuccess, error]);

    const handleInitialize = () => {
        if (!dayStartTimestamp || !dayLength) return;
        toastShown.current = false;
        setDaySettings(BigInt(dayStartTimestamp), BigInt(dayLength));
    };

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">🕐 Initialize Day Settings</h3>
            <p className="text-xs text-[#64748B] mb-2">
                Required for daily trading limits. Day 0 start timestamp and day length in seconds.
            </p>
            <p className="text-xs text-[#F59E0B] mb-4">⚠️ Run this once after deployment</p>

            {/* Current Day Settings */}
            {Boolean(currentDayStart) && currentDayStart !== BigInt(0) && (
                <div className="p-3 bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg mb-4">
                    <p className="text-xs text-[#EC4899] font-bold mb-2">📅 Current Day Settings (Active)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Day Start Time</p>
                            <p className="text-xs text-[#F8FAFC] font-mono">
                                {new Date(Number(currentDayStart) * 1000).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Day Length</p>
                            <p className="text-xs text-[#F8FAFC]">
                                {currentDayLength ? `${Number(currentDayLength) / 3600} hours` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] mb-1">Current Day #</p>
                            <p className="text-xs text-[#10B981] font-bold">
                                Day {currentDay?.toString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Timezone Input Component */}
            <TimezoneInput
                value={dayStartTimestamp}
                onChange={setDayStartTimestamp}
                label="Select Timezone for Day Start"
                description="Sets today's midnight as Day 0 start in selected timezone"
            />

            {/* Day Length */}
            <div className="mt-3">
                <label className="text-xs text-[#94A3B8] block mb-1">Day Length (seconds)</label>
                <input
                    type="text"
                    value={dayLength}
                    onChange={(e) => setDayLength(e.target.value)}
                    placeholder="86400"
                    className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                />
                <p className="text-[10px] text-[#64748B] mt-1">Default: 86400 (24 hours)</p>
            </div>

            <Button
                variant="primary"
                size="sm"
                onClick={handleInitialize}
                disabled={isPending || isConfirming || !dayStartTimestamp || !dayLength}
                className="w-full mt-4"
            >
                {isPending || isConfirming ? 'Initializing...' : '✨ Initialize Day Settings'}
            </Button>
        </Card>
    );
}
