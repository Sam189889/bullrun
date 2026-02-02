'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NFTDisplayConfig {
    filters: {
        hideAdminNFTs: boolean;
        hideUnlistedNFTs: boolean;
        hideBurnedNFTs: boolean;
        minPrice: number;
        maxPrice: number;
        hideNFTsBelowPrice: number;
    };
    sorting: {
        defaultSort: string;
        availableSorts: { id: string; label: string }[];
    };
    display: {
        showBuyCount: boolean;
        showCreatedDate: boolean;
        showLastTraded: boolean;
        showOwnerInfo: boolean;
        cardsPerRow: number;
        enableAnimations: boolean;
    };
    marketplace: {
        featuredNFTIds: number[];
        hiddenNFTIds: number[];
        hiddenOwnerIds: number[];
        pinnedNFTIds: number[];
    };
    lastUpdated: string;
    updatedBy: string;
}

const defaultConfig: NFTDisplayConfig = {
    filters: {
        hideAdminNFTs: false,
        hideUnlistedNFTs: false,
        hideBurnedNFTs: true,
        minPrice: 0,
        maxPrice: 0,
        hideNFTsBelowPrice: 0
    },
    sorting: {
        defaultSort: 'price_asc',
        availableSorts: [
            { id: 'price_asc', label: 'Price: Low to High' },
            { id: 'price_desc', label: 'Price: High to Low' },
            { id: 'newest', label: 'Newest First' },
            { id: 'oldest', label: 'Oldest First' }
        ]
    },
    display: {
        showBuyCount: true,
        showCreatedDate: true,
        showLastTraded: true,
        showOwnerInfo: true,
        cardsPerRow: 4,
        enableAnimations: true
    },
    marketplace: {
        featuredNFTIds: [],
        hiddenNFTIds: [],
        hiddenOwnerIds: [],
        pinnedNFTIds: []
    },
    lastUpdated: '',
    updatedBy: 'system'
};

export function useNFTDisplayConfig() {
    const [config, setConfig] = useState<NFTDisplayConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch config
    const fetchConfig = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/nft-display-config');
            if (!response.ok) throw new Error('Failed to fetch config');
            const data = await response.json();
            setConfig(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching NFT display config:', err);
            setError('Failed to load config');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update config
    const updateConfig = useCallback(async (updates: Partial<NFTDisplayConfig>) => {
        try {
            const response = await fetch('/api/nft-display-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Failed to update config');
            const data = await response.json();
            setConfig(data.config);
            return true;
        } catch (err) {
            console.error('Error updating NFT display config:', err);
            setError('Failed to update config');
            return false;
        }
    }, []);

    // Load on mount
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { config, isLoading, error, updateConfig, refetch: fetchConfig };
}

// Helper function to filter NFTs based on config
export function filterNFTsByConfig(
    nfts: any[],
    config: NFTDisplayConfig,
    formatPrice: (price: bigint) => number
): any[] {
    return nfts.filter(nft => {
        // Hide burned NFTs
        if (config.filters.hideBurnedNFTs && nft.isBurned) return false;

        // Hide admin (userId 1) NFTs
        if (config.filters.hideAdminNFTs && Number(nft.ownerId) === 1) return false;

        // Hide unlisted NFTs
        if (config.filters.hideUnlistedNFTs && !nft.isListed) return false;

        // Hide specific NFT IDs
        if (config.marketplace.hiddenNFTIds.includes(Number(nft.nftId))) return false;

        // Hide NFTs from specific owner IDs
        if (config.marketplace.hiddenOwnerIds.includes(Number(nft.ownerId))) return false;

        // Price filters
        const price = formatPrice(nft.currentPrice);
        if (config.filters.minPrice > 0 && price < config.filters.minPrice) return false;
        if (config.filters.maxPrice > 0 && price > config.filters.maxPrice) return false;
        if (config.filters.hideNFTsBelowPrice > 0 && price < config.filters.hideNFTsBelowPrice) return false;

        return true;
    });
}

// Helper function to sort NFTs based on config
export function sortNFTsByConfig(nfts: any[], sortId: string): any[] {
    const sorted = [...nfts];

    switch (sortId) {
        case 'price_asc':
            return sorted.sort((a, b) => Number(a.currentPrice - b.currentPrice));
        case 'price_desc':
            return sorted.sort((a, b) => Number(b.currentPrice - a.currentPrice));
        case 'newest':
            return sorted.sort((a, b) => Number(b.createdAt - a.createdAt));
        case 'oldest':
            return sorted.sort((a, b) => Number(a.createdAt - b.createdAt));
        case 'most_traded':
            return sorted.sort((a, b) => Number(b.buyCount - a.buyCount));
        case 'nft_id_asc':
            return sorted.sort((a, b) => Number(a.nftId - b.nftId));
        case 'nft_id_desc':
            return sorted.sort((a, b) => Number(b.nftId - a.nftId));
        default:
            return sorted;
    }
}
