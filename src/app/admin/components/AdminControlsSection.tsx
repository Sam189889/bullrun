'use client';

import { useState } from 'react';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export function AdminControlsSection() {
    const { controls, loading, refetch } = useAdminControls();
    const [saving, setSaving] = useState(false);

    const handleToggle = async (key: keyof typeof controls) => {
        setSaving(true);
        try {
            const newControls = { ...controls, [key]: !controls[key] };
            
            const res = await fetch('/api/admin/controls', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newControls)
            });

            if (res.ok) {
                toast.success(`${key.replace(/_/g, ' ')} ${!controls[key] ? 'enabled' : 'disabled'}`);
                refetch();
            } else {
                toast.error('Failed to update control');
            }
        } catch (error) {
            toast.error('Error updating control');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card variant="default">
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">🎛️ Admin Controls</h3>
                <p className="text-xs text-[#64748B]">Loading...</p>
            </Card>
        );
    }

    return (
        <Card variant="default">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">🎛️ Admin Controls</h3>
            <p className="text-xs text-[#64748B] mb-4">Enable/disable platform features</p>

            <div className="space-y-3">
                {/* Claim Rank EMI */}
                <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div>
                        <p className="text-sm text-[#F8FAFC] font-medium">💎 Claim Rank EMI</p>
                        <p className="text-xs text-[#64748B]">Allow users to claim rank EMI rewards</p>
                    </div>
                    <button
                        onClick={() => handleToggle('claim_rank_emi_enabled')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            controls.claim_rank_emi_enabled ? 'bg-[#10B981]' : 'bg-[#334155]'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                controls.claim_rank_emi_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {/* Claim Fast Bonus */}
                <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div>
                        <p className="text-sm text-[#F8FAFC] font-medium">⚡ Claim Fast Bonus</p>
                        <p className="text-xs text-[#64748B]">Allow users to claim fast start bonus</p>
                    </div>
                    <button
                        onClick={() => handleToggle('claim_fast_bonus_enabled')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            controls.claim_fast_bonus_enabled ? 'bg-[#10B981]' : 'bg-[#334155]'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                controls.claim_fast_bonus_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {/* Claim Withdraw */}
                <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div>
                        <p className="text-sm text-[#F8FAFC] font-medium">💰 Claim Withdraw</p>
                        <p className="text-xs text-[#64748B]">Allow users to withdraw earnings</p>
                    </div>
                    <button
                        onClick={() => handleToggle('claim_withdraw_enabled')}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            controls.claim_withdraw_enabled ? 'bg-[#10B981]' : 'bg-[#334155]'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                controls.claim_withdraw_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </Card>
    );
}
