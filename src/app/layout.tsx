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
            containerStyle={{
              zIndex: 99999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F172A',
                color: '#F8FAFC',
                border: '2px solid #EC4899',
                borderRadius: '12px',
                zIndex: 99999,
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 10px 40px rgba(236, 72, 153, 0.3)',
              },
              success: {
                style: {
                  border: '2px solid #10B981',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
                },
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F8FAFC',
                },
              },
              loading: {
                style: {
                  border: '2px solid #F59E0B',
                  boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
                },
                iconTheme: {
                  primary: '#F59E0B',
                  secondary: '#F8FAFC',
                },
              },
              error: {
                style: {
                  border: '2px solid #EF4444',
                  boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
                },
                iconTheme: {
                  primary: '#EF4444',
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
