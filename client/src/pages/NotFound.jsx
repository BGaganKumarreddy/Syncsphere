import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-9xl font-bold text-indigo-600">404</h1>
            <h2 className="text-2xl font-semibold text-slate-800 mt-4">Page Not Found</h2>
            <p className="text-slate-600 mt-2 mb-8 text-center max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                to="/dashboard"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
            >
                Go to Dashboard
            </Link>
        </div>
    );
}
