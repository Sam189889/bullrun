import { useState, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/config/constants';
import { BullRunMainLogicABI } from '@/abi';

interface UserWithQueue {
    userId: number;
    unlistedCount: number;
}

export function useUnlistedNFTIds() {
    const [usersWithQueue, setUsersWithQueue] = useState<UserWithQueue[]>([]);
    const [unlistedNFTIds, setUnlistedNFTIds] = useState<Set<number>>(new Set());

    // 1. Fetch users with queue count > 0
    useEffect(() => {
        fetch('/api/unlisted-nfts')
            .then(r => r.json())
            .then(data => setUsersWithQueue(data.users || []))
            .catch(() => setUsersWithQueue([]));
    }, []);

    // 2. Build contract calls for all unlisted NFT IDs
    const contractCalls = usersWithQueue.flatMap(({ userId, unlistedCount }) =>
        Array.from({ length: unlistedCount }, (_, i) => ({
            address: CONTRACTS.BULL_RUN,
            abi: BullRunMainLogicABI,
            functionName: 'userNFTs',
            args: [BigInt(userId), BigInt(i)]
        }))
    );

    // 3. Fetch all NFT IDs in one batch
    const { data: nftResults } = useReadContracts({
        contracts: contractCalls as any,
        query: { enabled: contractCalls.length > 0 }
    });

    // 4. Build Set of unlisted NFT IDs
    useEffect(() => {
        if (!nftResults) return;
        
        const ids = new Set<number>();
        nftResults.forEach((result: any) => {
            if (result?.result) {
                ids.add(Number(result.result));
            }
        });
        setUnlistedNFTIds(ids);
    }, [nftResults]);

    return { unlistedNFTIds, loading: !nftResults && contractCalls.length > 0 };
}
