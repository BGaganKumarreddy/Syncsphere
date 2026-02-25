import React from 'react';

export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl shadow-sm p-6 ${className}`}>
            {children}
        </div>
    );
}
