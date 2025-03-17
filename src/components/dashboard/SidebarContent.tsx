
import React, { useState } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  Code, 
  Users, 
  Bell, 
  Settings, 
  LayoutDashboard,
  Inbox,
  BarChart3,
  Star,
  GitPullRequestDraft
} from 'lucide-react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from '@/components/ui/sidebar';

export type SidebarItem = {
  title: string;
  icon: React.ElementType;
  id: string;
};

const mainItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard"
  },
  {
    title: "My Repositories",
    icon: GitBranch,
    id: "repositories"
  },
  {
    title: "Pull Requests",
    icon: GitPullRequest,
    id: "pull-requests"
  },
  {
    title: "Code Reviews",
    icon: Code,
    id: "code-reviews"
  },
  {
    title: "Team",
    icon: Users,
    id: "team"
  },
  {
    title: "Notifications",
    icon: Bell,
    id: "notifications"
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings"
  },
];

const recentRepositories = [
  {
    title: "frontend-project",
    icon: GitBranch,
    id: "frontend-project"
  },
  {
    title: "api-service",
    icon: GitBranch,
    id: "api-service"
  },
  {
    title: "data-processor",
    icon: GitBranch,
    id: "data-processor"
  },
];

export interface AppSidebarContentProps {
  activeItem: string;
  onItemClick: (item: SidebarItem) => void;
}

const AppSidebarContent: React.FC<AppSidebarContentProps> = ({ 
  activeItem,
  onItemClick
}) => {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  isActive={activeItem === item.id}
                  onClick={() => onItemClick(item)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarSeparator />
      
      <SidebarGroup>
        <SidebarGroupLabel>Recent Repositories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {recentRepositories.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeItem === item.id}
                  onClick={() => onItemClick(item)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default AppSidebarContent;
