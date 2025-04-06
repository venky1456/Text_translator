import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/globals.css';

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout; 