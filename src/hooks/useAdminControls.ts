interface AdminControls {
    claim_rank_emi_enabled: boolean;
    claim_fast_bonus_enabled: boolean;
    claim_withdraw_enabled: boolean;
    weekly_pool_enabled: boolean;
    lucky_draw_enabled: boolean;
}

/**
 * Admin controls - all features enabled by default
 * Database system removed, using contract-only approach
 */
export function useAdminControls() {
    const controls: AdminControls = {
        claim_rank_emi_enabled: true,
        claim_fast_bonus_enabled: true,
        claim_withdraw_enabled: true,
        weekly_pool_enabled: true,
        lucky_draw_enabled: true,
    };

    return { controls, loading: false, refetch: () => {} };
}
