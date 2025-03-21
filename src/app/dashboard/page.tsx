'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Search, Bell } from 'lucide-react';
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
import DashboardContent from '@/components/dashboard/DashboardContent';
import RepositoriesContent from '@/components/dashboard/RepositoriesContent';
import PullRequestsContent from '@/components/dashboard/PullRequestsContent';
import CodeReviewsContent from '@/components/dashboard/CodeReviewsContent';
import PlaceholderContent from '@/components/dashboard/PlaceholderContent';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [activeItemData, setActiveItemData] = useState<SidebarItem>({
    title: "Dashboard",
    icon: () => null,
    id: "dashboard"
  });
  
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    setActiveItemData(item);
  };

  if (status === 'unauthenticated') {
    return null;
  }

  const renderContent = () => {
    switch(activeItem) {
      case 'dashboard':
        return <DashboardContent />;
      case 'repositories':
        return <RepositoriesContent />;
      case 'pull-requests':
        return <PullRequestsContent />;
      case 'code-reviews':
        return <CodeReviewsContent />;
      default:
        return <PlaceholderContent activeItem={activeItemData} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <img src="/raccoon-logo.svg" alt="Review Raccoon" className="w-8 h-8" />
              <span className="font-display font-bold text-lg">Review Raccoon</span>
            </div>
          </SidebarHeader>
          
          <AppSidebarContent 
            activeItem={activeItem} 
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
                {/* <Search className="text-muted-foreground" size={18} /> */}
                <Bell className="text-muted-foreground" size={18} />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>
          
          <main className="container py-10 px-4 md:px-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 