import { useState, useEffect } from 'react';

export function useUserUnlistedCount(userId: bigint | undefined) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        
        fetch(`/api/unlisted-count/${userId}`)
            .then(res => res.json())
            .then(data => setCount(data.unlisted_count || 0))
            .catch(() => setCount(0))
            .finally(() => setLoading(false));
    }, [userId]);

    return { unlistedCount: count, loading };
}
