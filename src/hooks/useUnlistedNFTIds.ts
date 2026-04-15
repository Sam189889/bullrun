import { useState, useEffect, useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';

interface UserWithQueue {
    userId: number;
    unlistedCount: number;
}

/**
 * Fetches unlisted NFT IDs for ALL users (for marketplace filtering)
 * Uses timestamp-based approach: latest N NFTs for each user are unlisted
 */
export function useUnlistedNFTIds() {
    const [usersWithQueue, setUsersWithQueue] = useState<UserWithQueue[]>([]);

    // 1. Fetch users with queue count > 0 from database
    useEffect(() => {
        fetch('/api/unlisted-nfts')
            .then(r => r.json())
            .then(data => setUsersWithQueue(data.users || []))
            .catch(() => setUsersWithQueue([]));
    }, []);

    // 2. For each user, fetch their NFT count
    const userNFTCountCalls = useMemo(() => 
        usersWithQueue.map(({ userId }) => ({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'userNFTCount',
            args: [BigInt(userId)]
        }))
    , [usersWithQueue]);

    const { data: nftCountsData } = useReadContracts({
        contracts: userNFTCountCalls as any,
        query: { enabled: usersWithQueue.length > 0 }
    });

    // 3. Build calls to fetch ALL NFT IDs for each user
    const allNFTIdCalls = useMemo(() => {
        if (!nftCountsData) return [];
        
        return usersWithQueue.flatMap(({ userId }, idx) => {
            const count = nftCountsData[idx]?.result ? Number(nftCountsData[idx].result) : 0;
            return Array.from({ length: count }, (_, i) => ({
                address: CONTRACTS.BULL_RUN,
                abi: BullRunMainLogicABI,
                functionName: 'userNFTs',
                args: [BigInt(userId), BigInt(i)]
            }));
        });
    }, [usersWithQueue, nftCountsData]);

    const { data: allNFTIdsData } = useReadContracts({
        contracts: allNFTIdCalls as any,
        query: { enabled: allNFTIdCalls.length > 0 }
    });

    // 4. Fetch NFT details (for timestamps)
    const nftIds = useMemo(() => 
        allNFTIdsData?.map((r: any) => r?.result ? Number(r.result) : 0).filter((id: number) => id > 0) || []
    , [allNFTIdsData]);

    const nftDetailCalls = useMemo(() => 
        nftIds.map(nftId => ({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'nfts',
            args: [BigInt(nftId)]
        }))
    , [nftIds]);

    const { data: nftDetailsData } = useReadContracts({
        contracts: nftDetailCalls as any,
        query: { enabled: nftIds.length > 0 }
    });

    // 5. Compute unlisted NFT IDs (latest N for each user)
    const unlistedNFTIds = useMemo(() => {
        if (!nftDetailsData || !nftCountsData) return new Set<number>();

        const unlisted = new Set<number>();
        let nftDetailIndex = 0;

        usersWithQueue.forEach(({ userId, unlistedCount }, userIdx) => {
            const count = nftCountsData[userIdx]?.result ? Number(nftCountsData[userIdx].result) : 0;
            
            // Collect this user's NFTs with timestamps
            const userNFTsWithTime: { nftId: number; lastTradedAt: bigint }[] = [];
            
            for (let i = 0; i < count; i++) {
                const result = nftDetailsData[nftDetailIndex];
                if (result?.result) {
                    const nftArray = result.result as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean];
                    userNFTsWithTime.push({
                        nftId: nftIds[nftDetailIndex],
                        lastTradedAt: nftArray[7] // Index 7 is lastTradedAt
                    });
                }
                nftDetailIndex++;
            }

            // Sort by timestamp DESC (newest first)
            userNFTsWithTime.sort((a, b) => Number(b.lastTradedAt - a.lastTradedAt));

            // Mark first N as unlisted
            userNFTsWithTime.slice(0, unlistedCount).forEach(nft => {
                unlisted.add(nft.nftId);
            });
        });

        return unlisted;
    }, [nftDetailsData, nftCountsData, usersWithQueue, nftIds]);

    return { unlistedNFTIds, loading: !nftDetailsData && allNFTIdCalls.length > 0 };
}
