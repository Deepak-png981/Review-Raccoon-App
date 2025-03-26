'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import AppSidebarContent, { SidebarItem } from '@/components/dashboard/SidebarContent';
import { LoadingOverlay } from '@/components/ui/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [activeItemData, setActiveItemData] = React.useState<SidebarItem>(() => {
    const path = pathname?.split('/').pop() || 'dashboard';
    return {
      title: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
      icon: () => null,
      id: path
    };
  });

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      setIsNavigating(true);
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Logout error:', error);
      setIsNavigating(false);
    }
  };

  const handleItemClick = async (item: SidebarItem) => {
    setIsNavigating(true);
    setActiveItemData(item);
    
    try {
      if (item.id === 'dashboard') {
        await router.push('/dashboard');
      } else {
        await router.push(`/dashboard/${item.id}`);
      }
    } finally {
      setIsNavigating(false);
    }
  };

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <SidebarProvider>
      {isNavigating && <LoadingOverlay />}
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <img src="/raccoon-logo.svg" alt="Review Raccoon" className="w-8 h-8" />
              <span className="font-display font-bold text-lg">Review Raccoon</span>
            </div>
          </SidebarHeader>
          
          <AppSidebarContent 
            activeItem={activeItemData.id} 
            onItemClick={handleItemClick} 
          />
          
          <SidebarFooter>
            <div className="p-3">
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <header className="bg-background border-b sticky top-0 z-10">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="mr-2" />
                <span className="font-semibold">{activeItemData.title}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Image src={session?.user?.image || "/images/default-avatar.png"} alt="User Avatar" width={30} height={30} className="rounded-full" />
                <Bell className="text-muted-foreground cursor-pointer" size={18} onClick={() => handleItemClick({ id: 'notifications', title: 'Notifications', icon: Bell })} />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>
          
          <main className="container py-10 px-4 md:px-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
