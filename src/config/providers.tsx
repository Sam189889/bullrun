'use client'

import { getDefaultConfig, RainbowKitProvider, AvatarComponent } from '@rainbow-me/rainbowkit'
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    tokenPocketWallet,
    trustWallet,
    safepalWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { WagmiProvider, http, createStorage, cookieStorage } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { opBnbChain } from './wagmi'
import { NETWORK } from './constants'
import { WALLETCONNECT_PROJECT_ID } from './env'
import Image from 'next/image'

const projectId = WALLETCONNECT_PROJECT_ID

// Wagmi Config with specific wallets - SINGLETON (created once)
let wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;
const getWagmiConfig = () => {
    if (!wagmiConfig) {
        wagmiConfig = getDefaultConfig({
            appName: 'Bull Run NFT',
            projectId,
            chains: [opBnbChain],
            wallets: [
                {
                    groupName: 'Popular',
                    wallets: [
                        metaMaskWallet,
                        rainbowWallet,
                        tokenPocketWallet,
                        trustWallet,
                        safepalWallet,
                        walletConnectWallet,
                    ],
                },
            ],
            ssr: true,
            storage: createStorage({
                storage: cookieStorage,
            }),
            transports: {
                [opBnbChain.id]: http(NETWORK.rpcUrl),
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

// Custom Avatar Component with Logo
const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return (
        <div 
            style={{ width: size, height: size }} 
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-1"
        >
            <Image 
                src="/logo.png" 
                alt="Bull Run NFT" 
                width={size - 8} 
                height={size - 8}
                className="object-contain"
            />
        </div>
    );
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const config = getWagmiConfig();
    const queryClient = getQueryClient();
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider 
                    coolMode 
                    modalSize="compact" 
                    initialChain={opBnbChain}
                    avatar={CustomAvatar}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

