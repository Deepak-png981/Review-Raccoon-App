import React from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, RefreshCcw, Loader2, CheckCircle, Github, Link2, User } from 'lucide-react';
import ConnectRepositoryModal from '../../ConnectRepositoryModal';
import { GithubStatus } from '@/types/Repository';
import { RepositorySearch } from './RepositorySearch';

interface RepositoryHeaderProps {
  title: string;
  githubStatus: GithubStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
  onReconnect: () => void;
  isCheckingGithub: boolean;
  checkGithubConnection: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  filteredCount?: number;
  totalCount?: number;
  showSearch?: boolean;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  title,
  githubStatus,
  isLoading,
  onRefresh,
  onReconnect,
  isCheckingGithub,
  checkGithubConnection,
  searchQuery = '',
  setSearchQuery = () => {},
  filteredCount = 0,
  totalCount = 0,
  showSearch = false,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {githubStatus?.isConnected && githubStatus.tokenValid && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white dark:border-slate-800">
              <User size={22} className="text-white" />
            </div>
          )}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-20 blur-sm -z-10"></div>
            <div className="relative">
              <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
                {title}
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {showSearch && githubStatus?.isConnected && githubStatus?.tokenValid && !isLoading && (
            <RepositorySearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredCount={filteredCount}
              totalCount={totalCount}
              isHeaderVariant={true}
            />
          )}
          
          {isCheckingGithub ? (
            <Button 
              size="sm"
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700" 
              disabled
            >
              <Loader2 size={14} className="animate-spin" />
              Checking...
            </Button>
          ) : (
            (!githubStatus || !githubStatus.isConnected || !githubStatus.tokenValid) ? (
              <ConnectRepositoryModal />
            ) : (
              <Button 
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm" 
                disabled={isCheckingGithub}
              >
                <Github size={14} />
                GitHub Connected
              </Button>
            )
          )}
          
          <Button 
            size="sm"
            variant="outline"
            className="flex items-center gap-2" 
            onClick={checkGithubConnection}
            disabled={isCheckingGithub}
          >
            <RefreshCcw size={14} className={isCheckingGithub ? "animate-spin" : ""} />
            Check Connection
          </Button>
          
          {githubStatus?.isConnected && githubStatus?.tokenValid && (
            <Button 
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={onRefresh} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          )}
          
          {githubStatus && githubStatus.isConnected && !githubStatus.tokenValid && (
            <Button 
              size="sm"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white" 
              onClick={onReconnect}
            >
              <Link2 size={14} />
              Reconnect
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">        
        {showSearch && searchQuery && (
          <div className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            Search: "{searchQuery}"
          </div>
        )}
      </div>
      
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8 shadow-sm"></div>
    </div>
  );
}; 