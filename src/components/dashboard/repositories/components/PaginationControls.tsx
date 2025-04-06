import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationData } from '@/types/Repository';

interface PaginationControlsProps {
  pagination: PaginationData;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  isLoading,
  onPageChange,
}) => {
  if (pagination.totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    
    pageNumbers.push(1);
    
    // Pages around current page
    for (let i = Math.max(2, pagination.currentPage - 1); 
         i <= Math.min(pagination.totalPages - 1, pagination.currentPage + 1); 
         i++) {
      if (i === 2 && pagination.currentPage > 3) {
        pageNumbers.push('ellipsis1');
      } else if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Last ellipsis and last page
    if (pagination.currentPage < pagination.totalPages - 2) {
      pageNumbers.push('ellipsis2');
    }
    
    // Always include last page if not already included
    if (pagination.totalPages > 1 && !pageNumbers.includes(pagination.totalPages)) {
      pageNumbers.push(pagination.totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex justify-center mt-6 mb-10">
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        {/* Previous button */}
        <button 
          onClick={() => pagination.hasPreviousPage && onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage || isLoading}
          className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                    hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-100 
                    dark:disabled:hover:bg-slate-700 cursor-pointer"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Page buttons */}
        {getPageNumbers().map((pageNum, index) => 
          pageNum === 'ellipsis1' || pageNum === 'ellipsis2' ? (
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <button
              key={`page-${pageNum}`}
              onClick={() => pageNum !== pagination.currentPage && onPageChange(Number(pageNum))}
              disabled={pageNum === pagination.currentPage || isLoading}
              className={`
                px-3 py-2 rounded-md cursor-pointer text-center min-w-[40px]
                ${pageNum === pagination.currentPage 
                  ? 'bg-blue-500 text-white font-medium' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
              type="button"
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next button */}
        <button 
          onClick={() => pagination.hasNextPage && onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage || isLoading}
          className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                    hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-100 
                    dark:disabled:hover:bg-slate-700 cursor-pointer"
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 