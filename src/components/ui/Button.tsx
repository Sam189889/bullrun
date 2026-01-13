'use client';

import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    type = 'button',
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold
    transition-all duration-250 ease-out cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A]
  `;

    const variants = {
        primary: `
      bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#0F172A]
      hover:shadow-[0_4px_20px_rgba(255,215,0,0.4)] hover:-translate-y-0.5
      focus:ring-[#EC4899]
    `,
        secondary: `
      bg-transparent border-2 border-[#EC4899] text-[#EC4899]
      hover:bg-[#EC4899] hover:text-[#0F172A]
      focus:ring-[#EC4899]
    `,
        danger: `
      bg-[#EF4444] text-white
      hover:bg-[#F87171]
      focus:ring-[#EF4444]
    `,
        ghost: `
      bg-transparent text-[#94A3B8]
      hover:bg-[#1E293B] hover:text-[#F8FAFC]
      focus:ring-[#334155]
    `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-md',
        md: 'px-5 py-2.5 text-sm rounded-lg',
        lg: 'px-8 py-3.5 text-base rounded-xl',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}
