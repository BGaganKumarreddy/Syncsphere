import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme } = useTheme();
    const location = useLocation();

    return (
        <div className={`flex h-screen bg-[var(--bg-main)] transition-colors duration-300 ${theme}`}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {/* Page transition wrapper — re-mounts on route change */}
                    <div
                        key={location.pathname}
                        className="animate-fade-in-up h-full"
                    >
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
