'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
    useQueueRules,
    useQueueStats,
    createQueueRule,
    updateQueueRule,
    deleteQueueRule,
    toggleQueueRule,
    type QueueRule
} from '@/hooks/useAdminAPI';
import toast from 'react-hot-toast';

export function QueueRulesSection() {
    const { rules, loading: rulesLoading, refetch: refetchRules } = useQueueRules();
    const { stats, loading: statsLoading, refetch: refetchStats } = useQueueStats();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRule, setEditingRule] = useState<QueueRule | null>(null);

    const handleToggle = async (ruleId: number, enabled: boolean) => {
        try {
            await toggleQueueRule(ruleId, enabled);
            toast.success(enabled ? 'Rule enabled' : 'Rule disabled');
            refetchRules();
        } catch (err) {
            toast.error('Failed to toggle rule');
        }
    };

    const handleDelete = async (ruleId: number) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        
        try {
            await deleteQueueRule(ruleId);
            toast.success('Rule deleted');
            refetchRules();
            refetchStats();
        } catch (err) {
            toast.error('Failed to delete rule');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">🎯</span>
                        Queue Rules Management
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Control marketplace listing based on user stats
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-purple-600 hover:bg-purple-500"
                >
                    ➕ Add Rule
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Total Rules</p>
                    <p className="text-2xl font-bold text-white">
                        {stats?.total_rules || 0}
                    </p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Enabled Rules</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {stats?.enabled_rules || 0}
                    </p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Affected Users</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {stats?.total_users || 0}
                    </p>
                </div>
            </div>

            {/* Rules Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Priority
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Rule Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Config
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {rulesLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Loading rules...
                                    </td>
                                </tr>
                            ) : rules.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No rules configured. Add your first rule to get started.
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule) => (
                                    <tr key={rule.rule_id} className="hover:bg-slate-800/30">
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm font-mono">
                                                {rule.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-medium">{rule.rule_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                                rule.rule_type === 'package_based' ? 'bg-blue-500/20 text-blue-400' :
                                                rule.rule_type === 'direct_based' ? 'bg-purple-500/20 text-purple-400' :
                                                rule.rule_type === 'earnings_based' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-slate-500/20 text-slate-400'
                                            }`}>
                                                {rule.rule_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm space-y-1">
                                                <div className="text-slate-300">
                                                    💰 Threshold: <span className="text-emerald-400 font-mono">${(rule.config as any)?.threshold || 0}</span>
                                                </div>
                                                <div className="text-slate-300">
                                                    🎯 Slots: <span className="text-blue-400 font-mono">{(rule.config as any)?.queue_slots || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggle(rule.rule_id, !rule.enabled)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                    rule.enabled
                                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                        : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                                                }`}
                                            >
                                                {rule.enabled ? '✅ Enabled' : '❌ Disabled'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingRule(rule)}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.rule_id)}
                                                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Rule Modal */}
            {(showAddModal || editingRule) && (
                <RuleEditorModal
                    rule={editingRule}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingRule(null);
                    }}
                    onSave={() => {
                        refetchRules();
                        refetchStats();
                        setShowAddModal(false);
                        setEditingRule(null);
                    }}
                />
            )}
        </div>
    );
}

// Rule Editor Modal Component
function RuleEditorModal({
    rule,
    onClose,
    onSave
}: {
    rule: QueueRule | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [ruleName, setRuleName] = useState(rule?.rule_name || '');
    const [ruleType, setRuleType] = useState<QueueRule['rule_type']>(rule?.rule_type || 'earnings_based');
    const [priority, setPriority] = useState(rule?.priority || 10);
    
    // Extract config fields
    const [threshold, setThreshold] = useState((rule?.config as any)?.threshold || 500);
    const [queueSlots, setQueueSlots] = useState((rule?.config as any)?.queue_slots || 2);
    
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const ruleData = {
                rule_name: ruleName,
                rule_type: ruleType,
                priority,
                config: {
                    threshold: Number(threshold),
                    queue_slots: Number(queueSlots)
                },
                enabled: true
            };

            if (rule) {
                await updateQueueRule(rule.rule_id, ruleData);
                toast.success('Rule updated');
            } else {
                await createQueueRule(ruleData);
                toast.success('Rule created');
            }
            onSave();
        } catch (err) {
            toast.error('Failed to save rule');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">
                    {rule ? 'Edit Rule' : 'Add New Rule'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Rule Name
                        </label>
                        <input
                            type="text"
                            value={ruleName}
                            onChange={(e) => setRuleName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g., High Earners Bonus"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Rule Type
                        </label>
                        <select
                            value={ruleType}
                            onChange={(e) => setRuleType(e.target.value as QueueRule['rule_type'])}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="earnings_based">Earnings Based</option>
                            <option value="package_based">Package Based</option>
                            <option value="direct_based">Direct Referrals Based</option>
                            <option value="custom">Custom</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Priority (higher = applied first)
                        </label>
                        <input
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Threshold ($)
                            </label>
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="500"
                                min="0"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Minimum earnings/package value
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Queue Slots
                            </label>
                            <input
                                type="number"
                                value={queueSlots}
                                onChange={(e) => setQueueSlots(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                placeholder="2"
                                min="1"
                                max="10"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                NFTs to award (1-10)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !ruleName}
                        className="flex-1 bg-purple-600 hover:bg-purple-500"
                    >
                        {saving ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
                    </Button>
                    <Button
                        onClick={onClose}
                        className="flex-1 bg-slate-700 hover:bg-slate-600"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
