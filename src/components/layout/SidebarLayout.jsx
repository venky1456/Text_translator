import React from 'react';
import Sidebar from '../Sidebar';

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-background text-foreground">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;