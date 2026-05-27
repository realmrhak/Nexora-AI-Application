import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AppLayout;