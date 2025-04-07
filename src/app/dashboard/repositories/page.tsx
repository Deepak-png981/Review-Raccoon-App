'use client'

import { Suspense } from 'react';
import RepositoriesContent from '@/components/dashboard/RepositoriesContent';
import { Loader2 } from 'lucide-react';

const RepositoriesLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 size={40} className="animate-spin text-primary mb-4" />
      <h3 className="text-xl font-semibold">Loading repositories...</h3>
      <p className="text-muted-foreground mt-2">Please wait while we fetch your repositories</p>
    </div>
  );
};

export default function RepositoriesPage() {
  return (
    <Suspense fallback={<RepositoriesLoading />}>
      <RepositoriesContent />
    </Suspense>
  );
} 