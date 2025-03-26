'use client'

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[250px]" />
        <div className="space-y-4">
          {Array(5).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {/* Example notification items */}
        <div className="p-4 bg-card rounded-lg shadow flex items-start gap-4">
          <Bell className="text-primary mt-1" size={20} />
          <div>
            <h3 className="font-semibold">New Pull Request Review</h3>
            <p className="text-muted-foreground">John Doe requested your review on PR #123</p>
            <p className="text-sm text-muted-foreground mt-1">2 hours ago</p>
          </div>
        </div>
        {/* Add more notification items */}
      </div>
    </div>
  );
} 