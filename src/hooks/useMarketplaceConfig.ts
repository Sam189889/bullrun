'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MarketplaceConfig {
    hideUserId1: boolean;
    defaultSort: string;
    lastUpdated?: string;
    updatedBy?: string;
}

const defaultConfig: MarketplaceConfig = {
    hideUserId1: true,
    defaultSort: 'newest',
};

// Custom event name for config updates
const CONFIG_UPDATED_EVENT = 'marketplaceConfigUpdated';

export function useMarketplaceConfig() {
    const [config, setConfig] = useState<MarketplaceConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/marketplace-config', { cache: 'no-store' });
            const data = await res.json();

            if (data.success && data.config) {
                setConfig(data.config);
            }
        } catch (err) {
            console.error('Failed to fetch marketplace config:', err);
            setError('Failed to load config');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch config on mount and listen for updates
    useEffect(() => {
        fetchConfig();

        // Listen for config updates from other hook instances
        const handleConfigUpdate = () => {
            fetchConfig();
        };

        window.addEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
        return () => window.removeEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    }, [fetchConfig]);

    const updateConfig = useCallback(async (updates: Partial<MarketplaceConfig>): Promise<boolean> => {
        try {
            const newConfig = { ...config, ...updates };

            const res = await fetch('/api/marketplace-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig),
            });

            const data = await res.json();

            if (data.success && data.config) {
                setConfig(data.config);
                // Notify other hook instances to refetch
                window.dispatchEvent(new Event(CONFIG_UPDATED_EVENT));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update marketplace config:', err);
            return false;
        }
    }, [config]);

    return { config, isLoading, error, updateConfig, refetch: fetchConfig };
}
