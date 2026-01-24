import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/config/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bull Run NFT Trading Platform",
  description: "Community-Driven NFT Trading with Multi-Level Rewards",
  keywords: ["NFT", "Trading", "Crypto", "DeFi", "Community"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#1a1a2e',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1a1a2e',
                },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
