import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

// Import our new components
import AppSidebarContent, { SidebarItem } from '../components/dashboard/SidebarContent';
import DashboardContent from '../components/dashboard/DashboardContent';
import RepositoriesContent from '../components/dashboard/RepositoriesContent';
import PullRequestsContent from '../components/dashboard/PullRequestsContent';
import CodeReviewsContent from '../components/dashboard/CodeReviewsContent';
import PlaceholderContent from '../components/dashboard/PlaceholderContent';

const AppSidebar = ({ activeItem, onItemClick }: { activeItem: string, onItemClick: (item: SidebarItem) => void }) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <img src="/raccoon-logo.svg" alt="Review Raccoon" className="w-8 h-8" />
          <span className="font-display font-bold text-lg">Review Raccoon</span>
        </div>
      </SidebarHeader>
      
      <AppSidebarContent 
        activeItem={activeItem} 
        onItemClick={onItemClick} 
      />
      
      <SidebarFooter>
        <div className="p-3">
          <Button variant="outline" size="sm" className="w-full">
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [activeItemData, setActiveItemData] = useState<SidebarItem>({
    title: "Dashboard",
    icon: () => null,
    id: "dashboard"
  });
  
  const handleLogout = () => {
    navigate('/');
  };

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id);
    setActiveItemData(item);
    console.log(`Clicked on ${item.title}`);
  };

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
        <AppSidebar 
          activeItem={activeItem} 
          onItemClick={handleItemClick} 
        />
        
        <SidebarInset>
          <header className="bg-background border-b sticky top-0 z-10">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="mr-2" />
                <span className="font-semibold">{activeItemData.title}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Search className="text-muted-foreground" size={18} />
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
};

export default Dashboard;
