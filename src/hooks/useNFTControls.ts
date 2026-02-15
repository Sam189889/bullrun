import { useState, useEffect } from 'react';

export function useNFTControls() {
    const [pinnedNFTIds, setPinnedNFTIds] = useState<number[]>([]);
    const [hiddenNFTIds, setHiddenNFTIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchControls = async () => {
        try {
            const response = await fetch('/api/nft-controls');
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            setPinnedNFTIds(data.pinnedNFTIds || []);
            setHiddenNFTIds(data.hiddenNFTIds || []);
        } catch (error) {
            console.error('Error fetching NFT controls:', error);
            // Fallback to empty arrays if API not ready
            setPinnedNFTIds([]);
            setHiddenNFTIds([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchControls();
    }, []);

    const togglePin = async (nftId: number) => {
        const action = pinnedNFTIds.includes(nftId) ? 'unpin' : 'pin';
        
        try {
            const response = await fetch('/api/nft-controls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, nftId })
            });

            const data = await response.json();
            if (data.success) {
                setPinnedNFTIds(data.pinnedNFTIds);
                setHiddenNFTIds(data.hiddenNFTIds);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error toggling pin:', error);
            return false;
        }
    };

    const toggleHide = async (nftId: number) => {
        const action = hiddenNFTIds.includes(nftId) ? 'show' : 'hide';
        
        try {
            const response = await fetch('/api/nft-controls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, nftId })
            });

            const data = await response.json();
            if (data.success) {
                setPinnedNFTIds(data.pinnedNFTIds);
                setHiddenNFTIds(data.hiddenNFTIds);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error toggling hide:', error);
            return false;
        }
    };

    return {
        pinnedNFTIds,
        hiddenNFTIds,
        isLoading,
        togglePin,
        toggleHide,
        isPinned: (nftId: number) => pinnedNFTIds.includes(nftId),
        isHidden: (nftId: number) => hiddenNFTIds.includes(nftId),
        refetch: fetchControls
    };
}
