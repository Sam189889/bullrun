'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from '@/config/env';

interface Control {
    key: string;
    value: string;
    description: string;
    updated_at: string;
}

interface ControlGroup {
    [category: string]: {
        [key: string]: {
            value: string;
            description: string;
            updated_at: string;
        };
    };
}

export function AdminControlsSection() {
    const [controls, setControls] = useState<ControlGroup>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Fetch all controls
    useEffect(() => {
        fetchControls();
    }, []);

    const fetchControls = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/controls`);
            const data = await res.json();
            setControls(data);
        } catch (err) {
            toast.error('Failed to fetch admin controls');
        } finally {
            setLoading(false);
        }
    };

    const updateControl = async (category: string, key: string, value: string) => {
        setUpdating(`${category}_${key}`);
        try {
            const res = await fetch(`${API_BASE_URL}/controls/${category}_${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            });
            
            if (!res.ok) throw new Error('Update failed');
            
            // Update local state
            setControls(prev => {
                const updated = { ...prev };
                if (updated[category]) {
                    updated[category] = {
                        ...updated[category],
                        [key]: { ...updated[category][key], value }
                    };
                }
                return updated;
            });
            
            toast.success(`✅ ${key} updated`);
        } catch (err) {
            toast.error(`❌ Failed to update ${key}`);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-700 rounded w-48 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-slate-800 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">⚙️ Admin Controls</h2>
                <p className="text-xs text-[#64748B]">Manage feature toggles and system settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claim Controls */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        💰 Claim Controls
                    </h3>
                    <div className="space-y-4">
                        {controls.claim && Object.entries(controls.claim).map(([key, control]) => (
                            <ControlToggle
                                key={key}
                                label={formatLabel(key)}
                                description={control.description}
                                enabled={control.value === 'true'}
                                onToggle={(enabled) => updateControl('claim', key, enabled.toString())}
                                loading={updating === `claim_${key}`}
                            />
                        ))}
                    </div>
                </Card>

                {/* NFT Controls */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        🎨 NFT Display Controls
                    </h3>
                    <div className="space-y-4">
                        {controls.nft && Object.entries(controls.nft).map(([key, control]) => (
                            <ControlToggle
                                key={key}
                                label={formatLabel(key)}
                                description={control.description}
                                enabled={control.value === 'true'}
                                onToggle={(enabled) => updateControl('nft', key, enabled.toString())}
                                loading={updating === `nft_${key}`}
                            />
                        ))}
                    </div>
                </Card>

                {/* Queue Controls */}
                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        🚶 Queue System Controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {controls.queue && Object.entries(controls.queue).map(([key, control]) => {
                            if (key === 'mode') {
                                return (
                                    <QueueModeControl
                                        key={key}
                                        value={control.value}
                                        description={control.description}
                                        onModeChange={(mode) => updateControl('queue', key, mode)}
                                        loading={updating === `queue_${key}`}
                                    />
                                );
                            }
                            return (
                                <NumberInputControl
                                    key={key}
                                    label={formatLabel(key)}
                                    description={control.description}
                                    value={parseInt(control.value) || 0}
                                    onChange={(value) => updateControl('queue', key, value.toString())}
                                    loading={updating === `queue_${key}`}
                                />
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Toggle Control Component
function ControlToggle({
    label,
    description,
    enabled,
    onToggle,
    loading
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    loading: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-white font-medium">{label}</p>
                <p className="text-xs text-[#64748B] mt-1">{description}</p>
            </div>
            <button
                onClick={() => onToggle(!enabled)}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-emerald-500' : 'bg-slate-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
}

// Queue Mode Control Component
function QueueModeControl({
    value,
    description,
    onModeChange,
    loading
}: {
    value: string;
    description: string;
    onModeChange: (mode: string) => void;
    loading: boolean;
}) {
    const modes = [
        { value: 'disabled', label: 'Disabled', color: 'bg-slate-600' },
        { value: 'manual', label: 'Manual', color: 'bg-blue-600' },
        { value: 'auto', label: 'Auto', color: 'bg-emerald-600' }
    ];

    return (
        <div>
            <p className="text-white font-medium mb-2">Queue Mode</p>
            <p className="text-xs text-[#64748B] mb-3">{description}</p>
            <div className="flex gap-2">
                {modes.map((mode) => (
                    <button
                        key={mode.value}
                        onClick={() => onModeChange(mode.value)}
                        disabled={loading}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            value === mode.value
                                ? `${mode.color} text-white`
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Number Input Control Component
function NumberInputControl({
    label,
    description,
    value,
    onChange,
    loading
}: {
    label: string;
    description: string;
    value: number;
    onChange: (value: number) => void;
    loading: boolean;
}) {
    const [inputValue, setInputValue] = useState(value.toString());

    const handleSave = () => {
        const newValue = parseInt(inputValue);
        if (!isNaN(newValue) && newValue >= 0) {
            onChange(newValue);
        } else {
            toast.error('Please enter a valid number');
            setInputValue(value.toString());
        }
    };

    return (
        <div>
            <p className="text-white font-medium mb-2">{label}</p>
            <p className="text-xs text-[#64748B] mb-3">{description}</p>
            <div className="flex gap-2">
                <input
                    type="number"
                    min="0"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
                <Button
                    onClick={handleSave}
                    disabled={loading || inputValue === value.toString()}
                    size="sm"
                >
                    {loading ? '...' : 'Save'}
                </Button>
            </div>
        </div>
    );
}

// Helper function to format labels
function formatLabel(key: string): string {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
