'use client';

import { useState, useEffect, useRef } from 'react';
import { useSetDaySettings, useDayStartTimestamp, useDayLength, useCurrentDay } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TimezoneInput } from '@/components/ui/TimezoneInput';
import toast from 'react-hot-toast';

export function DaySettings() {
    const [mode, setMode] = useState<'date' | 'timezone'>('date');
    const [selectedDate, setSelectedDate] = useState('');
    const [timezoneTimestamp, setTimezoneTimestamp] = useState('');
    const [dayLength, setDayLength] = useState('86400');
    const [calculatedTimestamp, setCalculatedTimestamp] = useState<number | null>(null);
    const toastShown = useRef(false);

    const { data: currentDayStart } = useDayStartTimestamp();
    const { data: currentDayLength } = useDayLength();
    const { data: currentDay } = useCurrentDay();

    const { setDaySettings, isPending, isConfirming, isSuccess, error } = useSetDaySettings();

    // Calculate timestamp when date changes (always 8:30 AM GMT)
    useEffect(() => {
        if (mode === 'date' && selectedDate) {
            const [year, month, day] = selectedDate.split('-').map(Number);
            const timestamp = Date.UTC(year, month - 1, day, 8, 30, 0, 0) / 1000;
            setCalculatedTimestamp(timestamp);
        } else if (mode === 'timezone' && timezoneTimestamp) {
            setCalculatedTimestamp(Number(timezoneTimestamp));
        } else {
            setCalculatedTimestamp(null);
        }
    }, [mode, selectedDate, timezoneTimestamp]);

    useEffect(() => {
        if (isSuccess && !toastShown.current) {
            toastShown.current = true;
            toast.success('Day settings initialized!');
            setSelectedDate('');
            setTimezoneTimestamp('');
            setCalculatedTimestamp(null);
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Failed to set day settings');
        }
    }, [isSuccess, error]);

    const handleInitialize = () => {
        if (!calculatedTimestamp || !dayLength) return;
        toastShown.current = false;
        setDaySettings(BigInt(calculatedTimestamp), BigInt(dayLength));
    };

    const setToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
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
                                {new Date(Number(currentDayStart) * 1000).toLocaleString('en-GB', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                    timeZone: 'GMT'
                                })} GMT
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

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMode('date')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'date'
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                        }`}
                >
                    📅 Date Picker (8:30 AM GMT)
                </button>
                <button
                    onClick={() => setMode('timezone')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'timezone'
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                        }`}
                >
                    🌍 Timezone Selector
                </button>
            </div>

            {/* Date Picker Mode */}
            {mode === 'date' && (
                <div className="mb-3">
                    <label className="text-xs text-[#94A3B8] block mb-1">Select Start Date (Day 0)</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white font-mono text-sm focus:border-[#EC4899] outline-none"
                        />
                        <Button variant="secondary" size="sm" onClick={setToday}>
                            Today
                        </Button>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-1">
                        Time will be automatically set to <span className="text-[#EC4899]">8:30 AM GMT</span>
                    </p>
                </div>
            )}

            {/* Timezone Selector Mode */}
            {mode === 'timezone' && (
                <TimezoneInput
                    value={timezoneTimestamp}
                    onChange={setTimezoneTimestamp}
                    label="Select Timezone for Day Start"
                    description="Sets today's midnight as Day 0 start in selected timezone"
                />
            )}

            {/* Calculated Timestamp Preview */}
            {calculatedTimestamp && (
                <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg mb-3">
                    <p className="text-xs text-[#10B981] font-bold mb-1">✅ Calculated Timestamp</p>
                    <p className="text-xs text-[#F8FAFC] font-mono">
                        Unix: {calculatedTimestamp}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                        = {new Date(calculatedTimestamp * 1000).toLocaleString('en-GB', {
                            dateStyle: 'full',
                            timeStyle: 'long',
                            timeZone: 'GMT'
                        })}
                    </p>
                </div>
            )}

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
                disabled={isPending || isConfirming || !calculatedTimestamp || !dayLength}
                className="w-full mt-4"
            >
                {isPending || isConfirming ? 'Initializing...' : '✨ Initialize Day Settings'}
            </Button>
        </Card>
    );
}
