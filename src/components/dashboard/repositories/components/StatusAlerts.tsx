import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { GithubStatus } from '@/types/Repository';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface StatusAlertsProps {
  githubStatus: GithubStatus | null;
  repoError: string | null;
}

export const StatusAlerts: React.FC<StatusAlertsProps> = ({ 
  githubStatus,
  repoError
}) => {
  const searchParams = useSearchParams();
  const justConnected = searchParams?.get('github_connected') === 'true';

  return (
    <>
      {githubStatus && githubStatus.isConnected && githubStatus.tokenValid && justConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-500/50 text-green-800 dark:text-green-300 shadow-sm rounded-lg overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent"></div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 mt-0.5 mr-3 text-green-600 dark:text-green-400" />
              <div>
                <AlertTitle className="font-bold text-lg mb-1">Connected Successfully!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your GitHub account has been successfully connected. You can now access and manage your repositories.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
      
      {githubStatus && githubStatus.isConnected && !githubStatus.tokenValid && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 shadow-sm rounded-lg overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-amber-500/10 to-transparent"></div>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mt-0.5 mr-3 text-amber-500 dark:text-amber-400" />
              <div>
                <AlertTitle className="font-bold text-lg mb-1">GitHub Token Invalid</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Your GitHub account is connected, but the token is invalid: {githubStatus.tokenError || 'Unknown error'}. 
                  Please use the "Reconnect GitHub" button above.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}

      {repoError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-500/50 text-red-800 dark:text-red-300 shadow-sm rounded-lg overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-500/10 to-transparent"></div>
            <div className="flex items-start">
              <XCircle className="h-5 w-5 mt-0.5 mr-3 text-red-600 dark:text-red-400" />
              <div>
                <AlertTitle className="font-bold text-lg mb-1">Error Loading Repositories</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {repoError}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </>
  );
}; 