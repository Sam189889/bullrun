'use client';

import { createContext, useContext, ReactNode } from 'react';

// Context for lookup mode - provides target userId without wallet connection
interface LookupContextType {
    targetUserId: bigint | null;
    targetWallet: string | null;
    isLookupMode: boolean;
}

const LookupContext = createContext<LookupContextType>({
    targetUserId: null,
    targetWallet: null,
    isLookupMode: false,
});

// Provider component
export function LookupUserProvider({
    children,
    userId,
    wallet,
}: {
    children: ReactNode;
    userId: bigint | null;
    wallet: string | null;
}) {
    return (
        <LookupContext.Provider
            value={{
                targetUserId: userId,
                targetWallet: wallet,
                isLookupMode: true,
            }}
        >
            {children}
        </LookupContext.Provider>
    );
}

// Hook to check if in lookup mode and get target user
export function useLookupUser() {
    return useContext(LookupContext);
}

// Export context for direct use
export { LookupContext };
