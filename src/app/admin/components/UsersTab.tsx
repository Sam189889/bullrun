'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
import { useTotalUsers } from '@/hooks/useAdminContracts';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface UserData {
    id: number;
    wallet: string;
    packageLevel: number;
    totalInvested: bigint;
    earningCap: bigint;
    isActive: boolean;
    directReferrals: number;
}

export function UsersTab() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;

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

    // Parse user data - users mapping returns: [referrerId, packageLevel, totalInvested, earningCap, isActive, activationDate, directReferralsCount]
    const users: UserData[] = userIds.map((id, idx) => {
        const info = userInfoResults?.[idx]?.result as readonly [bigint, bigint, bigint, bigint, boolean, bigint, bigint] | undefined;
        const wallet = walletResults?.[idx]?.result as string | undefined;

        return {
            id,
            wallet: wallet || '0x...',
            packageLevel: info?.[1] ? Number(info[1]) : 0,
            totalInvested: info?.[2] ?? BigInt(0),
            earningCap: info?.[3] ?? BigInt(0),
            isActive: info?.[4] ?? false,
            directReferrals: info?.[6] ? Number(info[6]) : 0,
        };
    });

    // Filter by search
    const filteredUsers = search
        ? users.filter(u => u.wallet.toLowerCase().includes(search.toLowerCase()) || u.id.toString().includes(search))
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
                        placeholder="Search ID or wallet..."
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
                                <th className="text-left p-3 text-[#64748B] font-medium">Wallet</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Package</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Invested</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Status</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Directs</th>
                                <th className="text-left p-3 text-[#64748B] font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#64748B]">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#64748B]">
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
        </div>
    );
}
