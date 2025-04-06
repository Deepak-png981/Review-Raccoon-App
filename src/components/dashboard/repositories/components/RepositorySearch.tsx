import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, RefreshCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface RepositorySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCount: number;
  totalCount: number;
  isHeaderVariant?: boolean;
}

export const RepositorySearch: React.FC<RepositorySearchProps> = ({
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount,
  isHeaderVariant = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (!searchQuery) {
      setIsExpanded(false);
    }
  };

  const handleExpandSearch = () => {
    setIsExpanded(true);
    // Focus the input after expansion
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      containerRef.current && 
      !containerRef.current.contains(e.target as Node) && 
      isExpanded && 
      !searchQuery
    ) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExpanded, searchQuery]);

  if (isHeaderVariant) {
    return (
      <div className="relative flex justify-end" ref={containerRef}>
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              className="flex justify-end"
              initial={{ width: 40, opacity: 0.5 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 opacity-0 rounded-md group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  ref={inputRef}
                  placeholder="Search repositories..."
                  className="pl-9 pr-9 py-2 h-9 text-sm rounded-md border-slate-300 dark:border-slate-700 focus-visible:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleExpandSearch}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 rounded-md border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {searchQuery && (
          <div className="absolute top-10 right-0 mt-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md whitespace-nowrap">
            Found: {filteredCount} of {totalCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 relative" ref={containerRef}>
      <div className="flex justify-end items-center">
        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              className="w-full"
              initial={{ width: "50px", opacity: 0.5 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: "50px", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500 -z-10"></div>
                <div className="relative border-2 border-slate-200 dark:border-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors duration-300" />
                  <Input
                    ref={inputRef}
                    placeholder="Search repositories by name or description..."
                    className="pl-12 pr-12 py-6 border-0 shadow-none focus-visible:ring-0 rounded-lg text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    onClick={handleClearSearch}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={handleExpandSearch}
                size="icon"
                className="h-11 w-11 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md"
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {(isExpanded || searchQuery) && (
        <motion.div 
          className="mt-4 flex justify-between items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-sm text-muted-foreground">
            {searchQuery ? (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                Showing {filteredCount} of {totalCount} repositories for "<span className="font-semibold">{searchQuery}</span>"
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                Showing all {totalCount} repositories
              </span>
            )}
          </div>
          
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              onClick={handleClearSearch}
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-1" />
              Clear Search
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}; 