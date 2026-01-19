'use client'

import { useAccount } from 'wagmi'
import { isAdmin, ADMIN_WALLETS } from '@/config/constants'

/**
 * Hook to check if connected wallet is admin
 */
export function useIsAdmin() {
    const { address, isConnected } = useAccount()

    return {
        isAdmin: isConnected && address ? isAdmin(address) : false,
        address,
        isConnected,
    }
}

/**
 * Hook to get admin wallets list
 */
export function useAdminWallets() {
    return ADMIN_WALLETS
}
