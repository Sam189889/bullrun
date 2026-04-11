import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/env';

interface AdminControls {
    claim_rank_emi_enabled: boolean;
    claim_withdraw_enabled: boolean;
    claim_fast_bonus_enabled: boolean;
    weekly_pool_enabled: boolean;
    lucky_draw_enabled: boolean;
    nft_hide_system_enabled: boolean;
    nft_pin_system_enabled: boolean;
    queue_mode: string;
}

export function useAdminControls() {
    const [controls, setControls] = useState<AdminControls>({
        claim_rank_emi_enabled: true,
        claim_withdraw_enabled: true,
        claim_fast_bonus_enabled: true,
        weekly_pool_enabled: true,
        lucky_draw_enabled: true,
        nft_hide_system_enabled: true,
        nft_pin_system_enabled: true,
        queue_mode: 'disabled',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchControls();
    }, []);

    const fetchControls = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/controls`);
            const data = await res.json();
            
            // Parse grouped controls into flat structure
            const flatControls: AdminControls = {
                claim_rank_emi_enabled: data.claim?.rank_emi_enabled?.value === 'true',
                claim_withdraw_enabled: data.claim?.withdraw_enabled?.value === 'true',
                claim_fast_bonus_enabled: data.claim?.fast_bonus_enabled?.value === 'true',
                weekly_pool_enabled: data.claim?.weekly_pool_enabled?.value === 'true',
                lucky_draw_enabled: data.claim?.lucky_draw_enabled?.value === 'true',
                nft_hide_system_enabled: data.nft?.hide_system_enabled?.value === 'true',
                nft_pin_system_enabled: data.nft?.pin_system_enabled?.value === 'true',
                queue_mode: data.queue?.mode?.value || 'disabled',
            };
            
            setControls(flatControls);
        } catch (err) {
            console.error('Failed to fetch admin controls:', err);
            // Keep defaults on error
        } finally {
            setLoading(false);
        }
    };

    return { controls, loading, refetch: fetchControls };
}
