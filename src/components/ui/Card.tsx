'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'glow' | 'stat';
    onClick?: () => void;
    hover?: boolean;
}

export function Card({
    children,
    className = '',
    variant = 'default',
    onClick,
    hover = false,
}: CardProps) {
    const baseStyles = `
    rounded-xl p-5 transition-all duration-250 ease-out
    ${onClick ? 'cursor-pointer' : ''}
  `;

    const variants = {
        default: `
      bg-[#1E293B] border border-[#334155]
      ${hover ? 'hover:border-[#475569] hover:shadow-lg' : ''}
    `,
        glass: `
      bg-[rgba(30,41,59,0.8)] backdrop-blur-xl
      border border-[rgba(255,255,255,0.1)]
      ${hover ? 'hover:border-[rgba(255,255,255,0.2)] hover:shadow-xl' : ''}
    `,
        glow: `
      bg-[#1E293B] border border-[#EC4899]/30
      shadow-[0_0_20px_rgba(255,215,0,0.1)]
      ${hover ? 'hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:border-[#EC4899]/50' : ''}
    `,
        stat: `
      bg-gradient-to-br from-[#1E293B] to-[#0F172A]
      border border-[#334155]
      ${hover ? 'hover:border-[#EC4899]/30' : ''}
    `,
    };

    return (
        <div
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </div>
    );
}

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    change?: {
        value: number;
        positive: boolean;
    };
}

export function StatCard({ icon, label, value, change }: StatCardProps) {
    return (
        <Card variant="stat" hover>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[#64748B] text-sm mb-1">{label}</p>
                    <p className="text-2xl font-bold text-[#F8FAFC] font-mono">
                        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                    </p>
                    {change && (
                        <p className={`text-xs mt-1 ${change.positive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {change.positive ? '↑' : '↓'} {Math.abs(change.value)}% from yesterday
                        </p>
                    )}
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </Card>
    );
}
