import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Animated background orbs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="animate-float absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-600/12 rounded-full blur-[120px]" />
                <div className="animate-float-reverse absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[130px]" />
                <div
                    className="animate-float absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[90px]"
                    style={{ animationDelay: '2s' }}
                />
            </div>

            {/* Subtle grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="max-w-md w-full animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-4 shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform duration-300 cursor-default">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">SyncSphere</h1>
                    <p className="text-slate-500 mt-2 text-sm">Manage your projects with clarity</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
