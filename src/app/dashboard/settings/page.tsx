'use client'

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-[250px]" />
        <div className="grid gap-8">
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-[200px]" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <div className="space-y-4 p-6 bg-card rounded-lg shadow">
            {/* Add profile settings form */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4 p-6 bg-card rounded-lg shadow">
            {/* Add notification settings */}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">API Settings</h2>
          <div className="space-y-4 p-6 bg-card rounded-lg shadow">
            {/* Add API settings */}
          </div>
        </section>
      </div>
    </div>
  );
} 