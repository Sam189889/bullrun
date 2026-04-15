import { useState, useEffect } from 'react';

interface AdminControls {
    claim_rank_emi_enabled: boolean;
    claim_fast_bonus_enabled: boolean;
    claim_withdraw_enabled: boolean;
}

/**
 * Admin controls - fetched from database
 * Controls whether users can claim rank EMI, fast bonus, and withdraw
 */
export function useAdminControls() {
    const [controls, setControls] = useState<AdminControls>({
        claim_rank_emi_enabled: true,
        claim_fast_bonus_enabled: true,
        claim_withdraw_enabled: true,
    });
    const [loading, setLoading] = useState(true);

    const fetchControls = () => {
        fetch('/api/admin/controls')
            .then(r => r.json())
            .then(data => {
                setControls({
                    claim_rank_emi_enabled: data.claim_rank_emi_enabled ?? true,
                    claim_fast_bonus_enabled: data.claim_fast_bonus_enabled ?? true,
                    claim_withdraw_enabled: data.claim_withdraw_enabled ?? true,
                });
            })
            .catch(() => {
                // Use defaults on error
                setControls({
                    claim_rank_emi_enabled: true,
                    claim_fast_bonus_enabled: true,
                    claim_withdraw_enabled: true,
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchControls();
    }, []);

    return { controls, loading, refetch: fetchControls };
}
