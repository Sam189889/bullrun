import { useState, useEffect } from 'react';

type PinnedNFT = { nft_id: number; pin_order: number };

export function useNFTControls() {
    const [hiddenNFTs, setHiddenNFTs] = useState<number[]>([]);
    const [pinnedNFTs, setPinnedNFTs] = useState<PinnedNFT[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchControls = async () => {
        try {
            const res = await fetch('/api/nft-controls');
            const data = await res.json();
            setHiddenNFTs(data.hidden_nfts || []);
            setPinnedNFTs(data.pinned_nfts || []);
        } catch {
            setHiddenNFTs([]);
            setPinnedNFTs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchControls(); }, []);

    return { hiddenNFTs, pinnedNFTs, loading, refetch: fetchControls };
}
