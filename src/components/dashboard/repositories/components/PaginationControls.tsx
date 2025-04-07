import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationData } from '@/types/Repository';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

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
      <Pagination className="shadow-sm border  dark:border-slate-700 rounded-xl  dark:bg-slate-800 p-2">
        <PaginationContent className="gap-1 md:gap-2">
          {/* Previous Button */}
          <PaginationItem>
            <button
              onClick={() => pagination.hasPreviousPage && onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage || isLoading}
              className={cn(
                "flex items-center justify-center rounded-md w-9 h-9 text-sm",
                !pagination.hasPreviousPage || isLoading
                  ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </PaginationItem>

          {/* Page Buttons */}
          {getPageNumbers().map((pageNum, index) => 
            pageNum === 'ellipsis1' || pageNum === 'ellipsis2' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="text-slate-500 dark:text-slate-400 w-9 h-9" />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${pageNum}`}>
                <button
                  onClick={() => pageNum !== pagination.currentPage && onPageChange(Number(pageNum))}
                  disabled={pageNum === pagination.currentPage || isLoading}
                  className={cn(
                    "text-center rounded-md w-9 h-9 text-sm flex items-center justify-center",
                    pageNum === pagination.currentPage 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "bg-transparent dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  )}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === pagination.currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              </PaginationItem>
            )
          )}

          {/* Next Button */}
          <PaginationItem>
            <button
              onClick={() => pagination.hasNextPage && onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className={cn(
                "flex items-center justify-center rounded-md w-9 h-9 text-sm",
                !pagination.hasNextPage || isLoading
                  ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}; 