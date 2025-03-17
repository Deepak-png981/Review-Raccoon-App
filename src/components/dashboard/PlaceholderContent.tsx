
import React from 'react';
import { SidebarItem } from './SidebarContent';

interface PlaceholderContentProps {
  activeItem: SidebarItem;
}

const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ activeItem }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <activeItem.icon className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{activeItem.title}</h1>
      <p className="text-muted-foreground text-center max-w-md">
        This section is under development. Check back soon for more features
        related to {activeItem.title.toLowerCase()}.
      </p>
    </div>
  );
};

export default PlaceholderContent;
