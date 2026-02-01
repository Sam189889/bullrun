'use client';

import { useState, useEffect, useRef } from 'react';
import { useGetCurrentWeek, useWeekStartTimestamp, useSetWeekStartTimestamp } from '@/hooks/useAdminContracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TimezoneInput } from '@/components/ui/TimezoneInput';
import toast from 'react-hot-toast';

export function WeekManagement() {
    const { data: currentWeek, refetch: refetchWeek } = useGetCurrentWeek();
    const { data: weekStartTimestamp, refetch: refetchTimestamp } = useWeekStartTimestamp();

    const [startTimestamp, setStartTimestamp] = useState('');
    const toastShown1 = useRef(false);

    const { setStartTimestamp: setWeekStart, isPending: pending1, isConfirming: confirming1, isSuccess: success1 } = useSetWeekStartTimestamp();

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

    const handleSetAutoMode = () => {
        if (!startTimestamp) {
            toast.error('Please set a start timestamp');
            return;
        }
        toastShown1.current = false;
        setWeekStart(BigInt(startTimestamp));
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

            {/* Timezone Input Component */}
            <TimezoneInput
                value={startTimestamp}
                onChange={setStartTimestamp}
                label="Select Timezone for Week Start"
                description="Sets today's midnight as Week 1 start in selected timezone"
            />

            {/* Submit Button */}
            <Button
                variant="primary"
                size="sm"
                onClick={handleSetAutoMode}
                disabled={pending1 || confirming1 || !startTimestamp}
                className="w-full mt-4"
            >
                {pending1 || confirming1 ? 'Initializing...' : '✨ Initialize Week Settings'}
            </Button>
        </Card>
    );
}
