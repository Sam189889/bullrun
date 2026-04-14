'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useTotalUsers } from '@/hooks/useAdminContracts';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface UserData {
    id: number;
    wallet: string;
    usernameId: bigint;
    packageLevel: number;
    totalEarned: bigint;
    earningCap: bigint;
    isActive: boolean;
    directReferrals: number;
}

export function UsersTab() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    
    // Unlisted count modal
    const [showUnlistedModal, setShowUnlistedModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [unlistedInput, setUnlistedInput] = useState('');
    const [currentCount, setCurrentCount] = useState<number>(0);
    const [saving, setSaving] = useState(false);

    const handleUpdateUnlisted = async () => {
        if (!unlistedInput) return;
        const count = parseInt(unlistedInput);
        if (count < 0) {
            toast.error('Count cannot be negative');
            return;
        }
        
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/user-unlisted/${selectedUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unlisted_count: count })
            });
            
            if (res.ok) {
                toast.success(count === 0 ? 'Queue cleared!' : `Set ${count} NFTs unlisted`);
                setShowUnlistedModal(false);
                setUnlistedInput('');
                // Refresh counts
                setUnlistedCounts(prev => ({ ...prev, [selectedUserId]: count }));
            } else {
                toast.error('Failed to update');
            }
        } catch {
            toast.error('Error updating');
        } finally {
            setSaving(false);
        }
    };

    // Get total users count
    const { data: totalUsersData, isLoading: countLoading } = useTotalUsers();
    const totalUsers = totalUsersData ? Number(totalUsersData) : 0;

    // Calculate which users to fetch for current page
    const startId = page * pageSize + 1;
    const endId = Math.min(startId + pageSize - 1, totalUsers);
    const userIds = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);

    // Build contract calls for each user - use 'users' mapping instead of getUserInfo
    const userInfoCalls = userIds.map(id => ({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'users',
        args: [BigInt(id)],
    }));

    const walletCalls = userIds.map(id => ({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'allUsers',
        args: [BigInt(id - 1)], // allUsers is 0-indexed
    }));

    const balanceCalls = userIds.map(id => ({
        address: CONTRACTS.BULL_RUN,
        abi: BullRunMainLogicABI,
        functionName: 'userBalances',
        args: [BigInt(id)],
    }));

    const { data: userInfoResults, isLoading: usersLoading } = useReadContracts({
        contracts: userInfoCalls as any,
        query: { enabled: userIds.length > 0 && totalUsers > 0 }
    });

    const { data: walletResults } = useReadContracts({
        contracts: walletCalls as any,
        query: { enabled: userIds.length > 0 && totalUsers > 0 }
    });

    const { data: balanceResults } = useReadContracts({
        contracts: balanceCalls as any,
        query: { enabled: userIds.length > 0 && totalUsers > 0 }
    });

    // Fetch unlisted counts for displayed users
    const [unlistedCounts, setUnlistedCounts] = useState<Record<number, number>>({});
    
    useEffect(() => {
        if (userIds.length === 0) return;
        
        Promise.all(
            userIds.map(id => 
                fetch(`/api/unlisted-count/${id}`)
                    .then(r => r.json())
                    .then(data => ({ id, count: data.unlisted_count || 0 }))
                    .catch(() => ({ id, count: 0 }))
            )
        ).then(results => {
            const counts: Record<number, number> = {};
            results.forEach(({ id, count }) => counts[id] = count);
            setUnlistedCounts(counts);
        });
    }, [page, totalUsers]);

    // Parse user data - users mapping returns: [referrerId, packageLevel, totalInvested, earningCap, isActive, activationDate, directReferralsCount, usernameId]
    // userBalances returns: [totalEarned, availableBalance, withdrawnBalance]
    const users: UserData[] = userIds.map((id, idx) => {
        const info = userInfoResults?.[idx]?.result as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint] | undefined;
        const wallet = walletResults?.[idx]?.result as string | undefined;
        const balance = balanceResults?.[idx]?.result as readonly [bigint, bigint, bigint] | undefined;

        return {
            id,
            wallet: wallet || '0x...',
            usernameId: info?.[7] ?? BigInt(0),
            packageLevel: info?.[1] ? Number(info[1]) : 0,
            totalEarned: balance?.[0] ?? BigInt(0),
            earningCap: info?.[3] ?? BigInt(0),
            isActive: info?.[4] ?? false,
            directReferrals: info?.[6] ? Number(info[6]) : 0,
        };
    });

    // Filter by search (ID, wallet, or username)
    const filteredUsers = search
        ? users.filter(u => 
            u.wallet.toLowerCase().includes(search.toLowerCase()) || 
            u.id.toString().includes(search) ||
            u.usernameId.toString().includes(search) ||
            `BULL${u.usernameId}`.toLowerCase().includes(search.toLowerCase())
        )
        : users;

    const totalPages = Math.ceil(totalUsers / pageSize);
    const isLoading = countLoading || usersLoading;

    // Stats
    const activeUsers = users.filter(u => u.isActive).length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">👥 User Management</h2>
                    <p className="text-xs text-[#64748B]">{totalUsers} total users</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search ID, username, wallet..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 sm:w-64 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B]"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card variant="stat" className="text-center">
                    <p className="text-2xl font-bold text-[#10B981]">{totalUsers}</p>
                    <p className="text-xs text-[#64748B]">Total Users</p>
                </Card>
                <Card variant="stat" className="text-center">
                    <p className="text-2xl font-bold text-[#EC4899]">{activeUsers}</p>
                    <p className="text-xs text-[#64748B]">Active (this page)</p>
                </Card>
                <Card variant="stat" className="text-center">
                    <p className="text-2xl font-bold text-[#3B82F6]">{page + 1}/{totalPages || 1}</p>
                    <p className="text-xs text-[#64748B]">Page</p>
                </Card>
            </div>

            {/* Users Table */}
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-[#0F172A]">
                            <tr>
                                <th className="text-left p-3 text-[#64748B] font-medium">ID</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Username</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Wallet</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Package</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Total Earned</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Status</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Directs</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Queue</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-[#64748B]">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-[#64748B]">
                                    No users found
                                </td>
                            </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-[#334155] hover:bg-[#0F172A]/50">
                                        <td className="p-3 text-[#F8FAFC] font-mono">{user.id}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-mono font-bold">
                                                BULL{user.usernameId.toString()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[#94A3B8] font-mono text-xs">
                                            {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-xs font-bold">
                                                PKG {user.packageLevel}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#10B981] font-mono">
                                                ${user.totalEarned ? Number(formatUnits(user.totalEarned, 18)).toFixed(0) : '0'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${user.isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#3B82F6]">{user.directReferrals || 0}</span>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setCurrentCount(unlistedCounts[user.id] || 0);
                                                    setUnlistedInput('');
                                                    setShowUnlistedModal(true);
                                                }}
                                                className="px-2 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-xs hover:bg-[#F59E0B]/30 transition-colors font-bold"
                                            >
                                                {unlistedCounts[user.id] || 0} ✏️
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <Link
                                                href={`/lookup?id=${user.id}`}
                                                target="_blank"
                                                className="px-2 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-xs hover:bg-[#3B82F6]/30 transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-[#F8FAFC] disabled:opacity-50"
                    >
                        ← Prev
                    </button>
                    <span className="px-4 py-2 text-xs text-[#64748B]">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-[#F8FAFC] disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Unlisted Count Modal */}
            {showUnlistedModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowUnlistedModal(false)}>
                    <div className="bg-[#1E293B] border border-[#EC4899]/50 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[#F8FAFC] mb-4">🎯 Set Unlisted NFTs</h3>
                        
                        <div className="bg-[#EC4899]/10 border border-[#EC4899]/30 rounded-lg p-3 mb-4">
                            <p className="text-xs text-[#EC4899]">User #{selectedUserId}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-1">Current Queue: <span className="text-[#F59E0B] font-bold">{currentCount}</span></p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-[#94A3B8] mb-2">New Unlisted Count (0 to clear)</label>
                            <input
                                type="number"
                                min="0"
                                value={unlistedInput}
                                onChange={(e) => setUnlistedInput(e.target.value)}
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F8FAFC]"
                                placeholder="0"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowUnlistedModal(false)}
                                className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] py-2 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUnlisted}
                                disabled={saving || !unlistedInput}
                                className="flex-1 bg-[#EC4899] hover:bg-[#DB2777] text-white py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
