import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ isSidebarOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="animate-fade-in-down h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between px-6 transition-colors duration-300 z-10">

      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-lg focus:outline-none transition-all duration-200 hover:scale-105"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h16" />
            )}
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-[var(--text-main)] hidden md:block tracking-tight">
          Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-main)] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          title="Toggle Theme"
        >
          <span className="transition-all duration-300 block">
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-main)] transition-all duration-200 hover:scale-105 focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Active indicator dot */}
          <span className="animate-pulse-dot absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 border-2 border-[var(--bg-card)]" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-[var(--text-main)] leading-tight">{user?.name}</span>
            <span className="text-xs text-[var(--text-muted)] capitalize leading-tight">{user?.role?.toLowerCase()}</span>
          </div>

          {/* Avatar */}
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform duration-200 cursor-default shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
