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
import { opBnbMainnet } from './wagmi'
import { WALLETCONNECT_PROJECT_ID, RPC_URL } from './env'

const projectId = WALLETCONNECT_PROJECT_ID

// Wagmi Config with specific wallets - SINGLETON (created once)
let wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;
const getWagmiConfig = () => {
    if (!wagmiConfig) {
        wagmiConfig = getDefaultConfig({
            appName: 'Bull Run NFT',
            projectId,
            chains: [opBnbMainnet],
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
                [opBnbMainnet.id]: http(RPC_URL),
            },
        });
    }
    return wagmiConfig;
};

// QueryClient - SINGLETON (created once)
let queryClientInstance: QueryClient | null = null;
const getQueryClient = () => {
    if (!queryClientInstance) {
        queryClientInstance = new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    retry: 1,
                },
            },
        });
    }
    return queryClientInstance;
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const config = getWagmiConfig();
    const queryClient = getQueryClient();
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider coolMode modalSize="compact" initialChain={opBnbMainnet}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

