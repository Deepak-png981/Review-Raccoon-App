import React from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, RefreshCcw, Search, Github } from 'lucide-react';
import ConnectRepositoryModal from '../../ConnectRepositoryModal';
import { motion } from 'framer-motion';
interface NoRepositoriesProps {
  onRefresh: () => void;
}

export const NoRepositories: React.FC<NoRepositoriesProps> = ({ onRefresh }) => {
  return (
    <div className="rounded-xl border bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-8 text-center mb-6 shadow-md overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,transparent,black)] bg-[size:20px_20px]"></div>
      <div className="relative">
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 ring-4 ring-amber-50 dark:ring-amber-900/10 shadow-lg">
          <GitBranch size={32} className="text-amber-600 dark:text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No Repositories Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We couldn't find any repositories in your GitHub account. Create a new repository or refresh to try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 px-5 py-6 shadow-sm hover:shadow transition-all duration-300"
            onClick={onRefresh}
          >
            <RefreshCcw size={16} />
            Refresh
          </Button>
          <Button 
            className="flex items-center gap-2 px-5 py-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <GitBranch size={16} />
            Create Repository
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NoGithubConnection: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-slate-200/30 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/50 backdrop-blur-sm p-10 text-center mb-6 shadow-lg overflow-hidden relative"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/30 [mask-image:linear-gradient(to_bottom,transparent,black)] bg-[size:24px_24px]"></div>
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-indigo-500/10 blur-xl opacity-50"></div>
      
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 ring-2 ring-indigo-100 dark:ring-indigo-800/30 shadow-xl"
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Github size={36} className="text-indigo-500 dark:text-indigo-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-200 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Connect Your GitHub Account
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-base">
            Link your GitHub account to view and manage your repositories. 
            Get insights, track pull requests, and more.
          </p>
          
          <ConnectRepositoryModal trigger={
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0">
                <Github size={18} />
                Connect GitHub Now
              </Button>
            </motion.div>
          } />
        </motion.div>
      </div>
    </motion.div>
  );
};

interface NoSearchResultsProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const NoSearchResults: React.FC<NoSearchResultsProps> = ({ searchQuery, onClearSearch }) => {
  return (
    <div className="rounded-xl border bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-8 text-center mb-6 shadow-md overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,transparent,black)] bg-[size:20px_20px]"></div>
      <div className="relative">
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10 shadow-lg">
          <Search size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No Matching Repositories</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          No repositories match your search query "<span className="font-medium">{searchQuery}</span>". Try a different search term or clear your search.
        </p>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 px-5 py-6 shadow-sm hover:shadow transition-all duration-300"
          onClick={onClearSearch}
        >
          <RefreshCcw size={16} />
          Clear Search
        </Button>
      </div>
    </div>
  );
}; 