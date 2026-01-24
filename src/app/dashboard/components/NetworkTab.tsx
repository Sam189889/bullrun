'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserId, useUserInfo, useDirectReferrals } from '@/hooks/useContracts';

interface UserNode {
    userId: bigint;
    usernameId: bigint;
    level: number;
    isExpanded: boolean;
}

function NetworkNode({ 
    userId, 
    level, 
    maxLevel = 30 
}: { 
    userId: bigint; 
    level: number; 
    maxLevel?: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: userInfo } = useUserInfo(userId);
    const { data: referrals } = useDirectReferrals(userId);
    
    const user = userInfo as { usernameId: bigint; directReferralsCount: bigint } | undefined;
    const referralsList = referrals as readonly bigint[] | undefined;
    
    const hasReferrals = user && user.directReferralsCount > BigInt(0);
    const canExpand = hasReferrals && level < maxLevel;

    return (
        <div className="relative">
            {/* Connecting Line */}
            {level > 1 && (
                <div className="absolute left-[-20px] top-0 bottom-0 w-[2px] bg-[#334155]" />
            )}
            
            <div className="ml-6 mb-3">
                <div 
                    className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-lg hover:border-[#EC4899] transition-all cursor-pointer shadow-lg"
                    onClick={() => canExpand && setIsExpanded(!isExpanded)}
                >
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {canExpand ? (
                            isExpanded ? (
                                <span className="text-lg text-[#EC4899]">▼</span>
                            ) : (
                                <span className="text-lg text-[#64748B]">▶</span>
                            )
                        ) : (
                            <span className="text-[#334155]">●</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                                {user?.usernameId.toString().slice(0, 2) || '??'}
                            </span>
                        </div>
                        
                        <div>
                            <p className="text-sm font-bold text-[#F8FAFC]">
                                BULL{user?.usernameId.toString() || '...'}
                            </p>
                            <p className="text-xs text-[#64748B]">
                                Level {level} • {user?.directReferralsCount.toString() || '0'} Referrals
                            </p>
                        </div>
                    </div>

                    {/* Level Badge */}
                    <div className="px-3 py-1 bg-[#EC4899]/20 rounded-full text-xs font-bold text-[#EC4899] border border-[#EC4899]/30">
                        L{level}
                    </div>
                </div>

                {/* Render children if expanded */}
                {isExpanded && referralsList && referralsList.length > 0 && (
                    <div className="relative mt-2 pl-4 border-l-2 border-[#334155]">
                        {referralsList.map((refId, index) => (
                            <div key={refId.toString()} className="relative">
                                {/* Horizontal connector */}
                                <div className="absolute left-0 top-6 w-4 h-[2px] bg-[#334155]" />
                                
                                <NetworkNode 
                                    userId={refId} 
                                    level={level + 1}
                                    maxLevel={maxLevel}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function NetworkTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    const { data: userInfo } = useUserInfo(userId as bigint);
    const { data: referrals } = useDirectReferrals(userId as bigint);
    
    const user = userInfo as { usernameId: bigint; directReferralsCount: bigint } | undefined;
    const referralsList = referrals as readonly bigint[] | undefined;

    // Debug logging
    console.log('🌳 Network Tab Debug:', {
        userId: userId?.toString(),
        directReferralsCount: user?.directReferralsCount.toString(),
        referralsArray: referralsList?.map(r => r.toString()),
        referralsLength: referralsList?.length
    });

    if (!userId || userId === BigInt(0)) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-[#94A3B8]">Please register to view your network</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-[#F8FAFC] mb-1">🌳 My Network</h2>
                <p className="text-sm text-[#64748B]">
                    View your referral network up to 30 levels deep
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-xl">
                    <p className="text-xs text-[#64748B] mb-1">Your ID</p>
                    <p className="text-lg font-bold text-[#EC4899]">
                        BULL{user?.usernameId.toString() || '...'}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-xl">
                    <p className="text-xs text-[#64748B] mb-1">Direct Referrals</p>
                    <p className="text-lg font-bold text-[#10B981]">
                        {user?.directReferralsCount.toString() || '0'}
                    </p>
                </div>
            </div>

            {/* Network Tree */}
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                <h3 className="text-sm font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
                    <span className="text-[#EC4899]">👥</span>
                    Network Tree (Click to expand)
                </h3>

                {referralsList && referralsList.length > 0 ? (
                    <div>
                        {referralsList.map((refId) => (
                            <NetworkNode 
                                key={refId.toString()} 
                                userId={refId} 
                                level={1}
                                maxLevel={30}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-2">👥</div>
                        <p className="text-sm text-[#64748B]">No direct referrals yet</p>
                        <p className="text-xs text-[#64748B] mt-1">
                            Share your referral link to build your network
                        </p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl">
                <p className="text-xs text-[#3B82F6]">
                    💡 <strong>Tip:</strong> Click on any user to expand and view their downline up to 30 levels deep
                </p>
            </div>
        </div>
    );
}
