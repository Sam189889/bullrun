"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletConnectProps {
    showBalance?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "compact" | "custom";
    className?: string;
}

/**
 * Reusable wallet connection component
 * Uses RainbowKit's ConnectButton.Custom for Bull Run theme
 */
export function WalletConnect({
    showBalance = false,
    size = "md",
    variant = "default",
    className = "",
}: WalletConnectProps) {
    // Size classes
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus || authenticationStatus === 'authenticated');

                    return (
                        <div
                            {...(!ready && {
                                'aria-hidden': true,
                                style: {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                },
                            })}
                            className="flex items-center"
                        >
                            {(() => {
                                // Not connected - show connect button
                                if (!connected) {
                                    return (
                                        <button
                                            onClick={openConnectModal}
                                            type="button"
                                            className={`
                                                ${sizeClasses[size]}
                                                bg-gradient-to-r from-amber-500 to-orange-600 
                                                hover:from-amber-400 hover:to-orange-500
                                                text-white font-semibold rounded-xl
                                                shadow-lg shadow-amber-500/25
                                                hover:shadow-amber-500/40
                                                transition-all duration-300
                                                hover:scale-[1.02] active:scale-[0.98]
                                                flex items-center gap-2
                                            `}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Connect Wallet
                                        </button>
                                    );
                                }

                                // Wrong network
                                if (chain.unsupported) {
                                    return (
                                        <button
                                            onClick={openChainModal}
                                            type="button"
                                            className={`
                                                ${sizeClasses[size]}
                                                bg-red-500 hover:bg-red-600
                                                text-white font-semibold rounded-xl
                                                shadow-lg transition-all duration-300
                                                flex items-center gap-2
                                            `}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            Wrong Network
                                        </button>
                                    );
                                }

                                // Connected - show chain and account
                                return (
                                    <div className="flex items-center gap-2">
                                        {/* Chain Button */}
                                        <button
                                            onClick={openChainModal}
                                            type="button"
                                            className="
                                                flex items-center gap-1.5
                                                px-2.5 py-2
                                                bg-[#1E293B]/80 hover:bg-[#1E293B]
                                                rounded-xl border border-[#334155]
                                                transition-all duration-200
                                            "
                                        >
                                            {chain.hasIcon && (
                                                <div
                                                    className="w-5 h-5 rounded-full overflow-hidden"
                                                    style={{ background: chain.iconBackground }}
                                                >
                                                    {chain.iconUrl && (
                                                        <img
                                                            alt={chain.name ?? 'Chain'}
                                                            src={chain.iconUrl}
                                                            className="w-5 h-5"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </button>

                                        {/* Account Button */}
                                        <button
                                            onClick={openAccountModal}
                                            type="button"
                                            className="
                                                flex items-center gap-2
                                                px-3 py-2
                                                bg-gradient-to-r from-amber-500/10 to-orange-600/10
                                                hover:from-amber-500/20 hover:to-orange-600/20
                                                rounded-xl border border-amber-500/30
                                                transition-all duration-200
                                            "
                                        >
                                            {/* Balance */}
                                            {showBalance && account.displayBalance && (
                                                <span className="text-xs font-medium text-amber-400">
                                                    {account.displayBalance}
                                                </span>
                                            )}

                                            {/* Avatar */}
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                {account.ensAvatar ? (
                                                    <img
                                                        src={account.ensAvatar}
                                                        alt="Avatar"
                                                        className="w-5 h-5 rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-[8px] text-white font-bold">
                                                        {account.displayName.slice(0, 2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Address */}
                                            <span className="text-sm font-medium text-white">
                                                {account.displayName}
                                            </span>
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                }}
            </ConnectButton.Custom>
        </div>
    );
}

export default WalletConnect;
