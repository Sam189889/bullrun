'use client'

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    tokenPocketWallet,
    trustWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { WagmiProvider, http, createStorage, cookieStorage } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { opBnbTestnet } from './wagmi'
import { WALLETCONNECT_PROJECT_ID, RPC_URL } from './env'

const projectId = WALLETCONNECT_PROJECT_ID

// Wagmi Config with specific wallets
const config = getDefaultConfig({
    appName: 'Bull Run NFT',
    projectId,
    chains: [opBnbTestnet],
    wallets: [
        {
            groupName: 'Popular',
            wallets: [
                metaMaskWallet,
                rainbowWallet,
                tokenPocketWallet,
                trustWallet,
                walletConnectWallet,
            ],
        },
    ],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: {
        [opBnbTestnet.id]: http(RPC_URL),
    },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider coolMode modalSize="compact" initialChain={opBnbTestnet}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
