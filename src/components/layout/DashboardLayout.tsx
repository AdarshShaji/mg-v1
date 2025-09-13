// src/components/layout/DashboardLayout.tsx (Corrected Version)

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // Assuming Sidebar is a named export from './Sidebar.tsx'

const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* The Outlet is where nested routes from App.tsx will be rendered */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;