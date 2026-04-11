'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { useTotalUsers } from '@/hooks/useAdminContracts';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/env';

interface UserData {
    id: number;
    wallet: string;
    packageLevel: number;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    directReferrals: number;
    usernameId: number;
    queueSlots?: number;
}

export function UsersTab() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
    const [queueSlotsInput, setQueueSlotsInput] = useState('');
    const [queueSlotsData, setQueueSlotsData] = useState<Record<number, number>>({});
    const [updatingQueueSlots, setUpdatingQueueSlots] = useState(false);

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

    const { data: userInfoResults, isLoading: usersLoading } = useReadContracts({
        contracts: userInfoCalls as any,
        query: { enabled: userIds.length > 0 && totalUsers > 0 }
    });

    const { data: walletResults } = useReadContracts({
        contracts: walletCalls as any,
        query: { enabled: userIds.length > 0 && totalUsers > 0 }
    });

    // Parse user data - users mapping returns: [referrerId, packageLevel, totalInvested, earningCap, isActive, activationDate, directReferralsCount, usernameId]
    const users: UserData[] = userIds.map((id, idx) => {
        const info = userInfoResults?.[idx]?.result as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint] | undefined;
        const wallet = walletResults?.[idx]?.result as string | undefined;

        return {
            id,
            wallet: wallet || '0x...',
            packageLevel: info?.[1] ? Number(info[1]) : 0,
            totalInvested: info?.[2] ?? BigInt(0),
            earningCap: info?.[3] ?? BigInt(0),
            isActive: info?.[4] ?? false,
            directReferrals: info?.[6] ? Number(info[6]) : 0,
            usernameId: info?.[7] ? Number(info[7]) : 0,
            queueSlots: queueSlotsData[id] ?? 0,
        };
    });

    // Fetch queue slots when page changes
    useEffect(() => {
        const fetchQueueSlots = async () => {
            if (userIds.length === 0) return;
            
            const promises = userIds.map(async (userId) => {
                try {
                    const res = await fetch(`${API_BASE_URL}/users/${userId}/queue-status`);
                    const data = await res.json();
                    return { userId, queueSlots: data.queue_slots || 0 };
                } catch (err) {
                    return { userId, queueSlots: 0 };
                }
            });
            const results = await Promise.all(promises);
            const slotsMap: Record<number, number> = {};
            results.forEach(r => slotsMap[r.userId] = r.queueSlots);
            setQueueSlotsData(slotsMap);
        };

        fetchQueueSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, totalUsers]);

    const updateQueueSlots = async () => {
        if (!selectedUser) return;
        
        const slots = parseInt(queueSlotsInput);
        if (isNaN(slots) || slots < 0 || slots > 10) {
            toast.error('Queue slots must be between 0 and 10');
            return;
        }

        setUpdatingQueueSlots(true);
        try {
            const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/queue-slots`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queue_slots: slots })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${res.status}`);
            }
            
            const result = await res.json();
            setQueueSlotsData(prev => ({ ...prev, [selectedUser.id]: slots }));
            setShowQueueModal(false);
            toast.success(`✅ Queue slots updated to ${slots} for ${selectedUser.username}`);
        } catch (err: any) {
            console.error('Queue update error:', err);
            toast.error(`❌ ${err.message || 'Failed to update queue slots'}`);
        } finally {
            setUpdatingQueueSlots(false);
        }
    };

    const openQueueModal = (userId: number, username: string, currentSlots: number) => {
        setSelectedUser({ id: userId, username });
        setQueueSlotsInput(String(currentSlots));
        setShowQueueModal(true);
    };

    // Filter by search
    const filteredUsers = search
        ? users.filter(u => 
            u.wallet.toLowerCase().includes(search.toLowerCase()) || 
            u.id.toString().includes(search) ||
            (u.usernameId > 0 && `BULL${u.usernameId}`.toLowerCase().includes(search.toLowerCase()))
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
                        placeholder="Search ID, username, or wallet..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 sm:w-48 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B]"
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
                                <th className="text-left p-3 text-[#64748B] font-medium">Invested</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Status</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Directs</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Queue Slots</th>
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
                                    <tr key={user.id} className="hover:bg-[#0F172A]/50 transition-colors">
                                        <td className="p-3">
                                            <span className="text-[#EC4899] font-bold">#{user.id}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#F59E0B] font-mono text-xs font-bold">
                                                {user.usernameId > 0 ? `BULL${user.usernameId}` : '-'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#F8FAFC] font-mono text-xs">
                                                {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#D946EF] font-bold">Pkg {user.packageLevel}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-[#10B981] font-mono">
                                                ${user.totalInvested ? Number(formatUnits(user.totalInvested, 18)).toFixed(0) : '0'}
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
                                                onClick={() => openQueueModal(
                                                    user.id,
                                                    user.usernameId > 0 ? `BULL${user.usernameId}` : `User #${user.id}`,
                                                    user.queueSlots || 0
                                                )}
                                                className="flex items-center gap-1 px-2 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded hover:bg-[#F59E0B]/30 transition-colors text-xs"
                                            >
                                                📦 {user.queueSlots || 0}
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

            {/* Queue Slots Modal */}
            {showQueueModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#F59E0B]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                                    📦 Queue Slots
                                </h3>
                                <p className="text-sm text-[#64748B] mt-1">{selectedUser.username}</p>
                            </div>
                            <button
                                onClick={() => setShowQueueModal(false)}
                                className="text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 mb-6">
                            <p className="text-xs text-[#94A3B8] mb-2">
                                💡 <strong>Queue slots</strong> determine how many NFTs stay <strong>unlisted</strong> (held in queue).
                            </p>
                            <div className="text-xs text-[#64748B] space-y-1 mt-3">
                                <p>• 0 slots = All NFTs auto-list</p>
                                <p>• 2 slots = First 2 NFTs held, rest listed</p>
                                <p>• 5 slots = First 5 NFTs held, rest listed</p>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                                Queue Slots (0-10)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={queueSlotsInput}
                                onChange={(e) => setQueueSlotsInput(e.target.value)}
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] text-lg font-bold focus:border-[#F59E0B] focus:outline-none transition-colors"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') updateQueueSlots();
                                    if (e.key === 'Escape') setShowQueueModal(false);
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQueueModal(false)}
                                className="flex-1 px-4 py-3 bg-[#334155] text-[#F8FAFC] rounded-lg hover:bg-[#475569] transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateQueueSlots}
                                disabled={updatingQueueSlots}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#0F172A] rounded-lg hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingQueueSlots ? '⏳ Updating...' : '✅ Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
