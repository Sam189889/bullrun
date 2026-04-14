'use client';

import { useMemo } from 'react';
import { useNFT } from '@/hooks/useAdminContracts';

interface NFTPaginationProps {
    totalNFTs: number;
    filterOwnerId: string;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function NFTPagination({ totalNFTs, filterOwnerId, currentPage, itemsPerPage, onPageChange }: NFTPaginationProps) {
    // Calculate actual count based on filter
    const { totalPages, totalFilteredNFTs } = useMemo(() => {
        // If no filter, use total count
        if (!filterOwnerId) {
            const pages = Math.ceil(totalNFTs / itemsPerPage);
            return { totalPages: pages, totalFilteredNFTs: totalNFTs };
        }
        
        // With filter, we need to estimate
        // For now, use total count (filtering happens at render level)
        const pages = Math.ceil(totalNFTs / itemsPerPage);
        return { totalPages: pages, totalFilteredNFTs: totalNFTs };
    }, [totalNFTs, filterOwnerId, itemsPerPage]);
    
    if (totalPages <= 1) return null;
    
    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;
        
        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination
            if (currentPage <= 3) {
                // Near start
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };
    
    const pageNumbers = getPageNumbers();
    
    return (
        <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-sm text-slate-400">
                    Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
                    {filterOwnerId && (
                        <span className="ml-2 text-indigo-400">
                            (Filtered)
                        </span>
                    )}
                </div>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        ← Prev
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                        {pageNumbers.map((page, idx) => (
                            typeof page === 'number' ? (
                                <button
                                    key={idx}
                                    onClick={() => onPageChange(page)}
                                    className={`
                                        min-w-[36px] h-[36px] rounded-lg text-sm font-medium transition-all
                                        ${page === currentPage
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={idx} className="px-2 text-slate-600">
                                    {page}
                                </span>
                            )
                        ))}
                    </div>
                    
                    {/* Next Button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Next →
                    </button>
                </div>
                
                {/* Items Info */}
                <div className="text-sm text-slate-400">
                    Showing <span className="text-white font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredNFTs)}</span> - <span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, totalFilteredNFTs)}</span> of <span className="text-white font-semibold">{totalFilteredNFTs}</span>
                </div>
            </div>
        </div>
    );
}
